import path from 'path'
import fs from 'fs-extra'
import { execa } from 'execa'
import type { BuildOptions, PlatformAdapter, ManifestBase } from '../types'

export class AndroidAdapter implements PlatformAdapter {
  name = 'Android TV'

  async build(options: BuildOptions): Promise<void> {
    const distDir = `${options.outDir}/android`
    await this.createWebViewProject(distDir)
  }

  async package(distDir: string): Promise<string> {
    const projectDir = path.join(distDir, 'android-project')

    try {
      await execa('./gradlew', ['assembleRelease'], {
        cwd: projectDir,
        stdio: 'inherit',
      })

      const apkPath = path.join(projectDir, 'app/build/outputs/apk/release/app-release.apk')

      const outputPath = path.join(distDir, '..', 'app.apk')
      await fs.copy(apkPath, outputPath)

      return outputPath
    } catch (error) {
      throw new Error('Android build failed. Make sure Android SDK is installed.')
    }
  }

  private async createWebViewProject(distDir: string) {
    const pkg = await this.readPackageJson()
    const projectDir = path.join(distDir, 'android-project')

    await fs.ensureDir(projectDir)
    await fs.copy(distDir, path.join(projectDir, 'app/src/main/assets/www'))

    await this.createManifest(projectDir, pkg)
    await this.createGradleFiles(projectDir, pkg)
    await this.createMainActivity(projectDir, pkg)
  }

  private async createManifest(projectDir: string, pkg: ManifestBase) {
    const manifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${pkg.id || 'com.example.app'}">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-feature android:name="android.software.leanback" android:required="true" />
    <uses-feature android:name="android.hardware.touchscreen" android:required="false" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${pkg.name}"
        android:banner="@drawable/banner"
        android:theme="@style/Theme.Leanback">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="landscape">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`

    const manifestPath = path.join(projectDir, 'app/src/main/AndroidManifest.xml')
    await fs.ensureDir(path.dirname(manifestPath))
    await fs.writeFile(manifestPath, manifest)
  }

  private async createGradleFiles(projectDir: string, pkg: ManifestBase) {
    const buildGradle = `plugins {
    id 'com.android.application'
}

android {
    namespace '${pkg.id || 'com.example.app'}'
    compileSdk 34

    defaultConfig {
        applicationId "${pkg.id || 'com.example.app'}"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "${pkg.version}"
    }

    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt')
        }
    }
}

dependencies {
    implementation 'androidx.leanback:leanback:1.0.0'
}`

    await fs.writeFile(path.join(projectDir, 'app/build.gradle'), buildGradle)
  }

  private async createMainActivity(projectDir: string, pkg: ManifestBase) {
    const packageName = pkg.id || 'com.example.app'
    const activity = `package ${packageName};

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        webView = new WebView(this);
        setContentView(webView);
        
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        
        webView.loadUrl("file:///android_asset/www/index.html");
    }
}`

    const activityPath = path.join(
      projectDir,
      `app/src/main/java/${packageName.replace(/\./g, '/')}/MainActivity.java`,
    )
    await fs.ensureDir(path.dirname(activityPath))
    await fs.writeFile(activityPath, activity)
  }

  private async readPackageJson(): Promise<ManifestBase> {
    try {
      const pkg = await fs.readJson('package.json')
      return {
        id: pkg.androidAppId || pkg.name.replace(/[^a-z0-9]/gi, '.').toLowerCase(),
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
      }
    } catch {
      return {
        id: 'com.example.app',
        name: 'Table App',
        version: '1.0.0',
      }
    }
  }
}
