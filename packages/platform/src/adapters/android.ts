import path from 'path'
import fs from 'fs-extra'
import { execa } from 'execa'
import type { BuildOptions, PlatformAdapter, ManifestBase } from '../types'

export class AndroidAdapter implements PlatformAdapter {
  name = 'Android TV'

  async build(options: BuildOptions): Promise<void> {
    if (options.mode === 'native') {
      await this.native(options.dir)
      return
    }

    await this.web(options.dir)
  }

  async package(options: BuildOptions): Promise<string> {
    const proj = path.join(options.dir, 'project')
    const cmd = await this.cmd(proj)

    if (!cmd) {
      return proj
    }

    try {
      await execa(cmd, ['assembleRelease'], {
        cwd: proj,
        stdio: 'inherit',
      })

      const apk = path.join(proj, 'app/build/outputs/apk/release/app-release.apk')
      const out = path.join(options.dir, '..', this.apk(options))
      await fs.copy(apk, out)

      return out
    } catch {
      throw new Error('Android build failed. Install the Android SDK and Gradle, or add a Gradle wrapper.')
    }
  }

  private async web(dir: string) {
    const pkg = await this.pkg()
    const proj = path.join(dir, 'project')

    await fs.remove(proj)
    await this.root(proj, pkg)
    await this.man(proj, pkg, true)
    await this.app(proj, pkg, false)
    await this.res(proj)
    await this.webKt(proj, pkg)
    await fs.copy(path.join(dir, 'www'), path.join(proj, 'app/src/main/assets/www'))
  }

  private async native(dir: string) {
    const pkg = await this.pkg()
    const proj = path.join(dir, 'project')

    await fs.remove(proj)
    await this.root(proj, pkg)
    await this.man(proj, pkg, false)
    await this.app(proj, pkg, true)
    await this.res(proj)
    await this.nativeKt(proj, pkg)
  }

  private async root(proj: string, pkg: ManifestBase) {
    const settings = `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(org.gradle.api.initialization.resolve.RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "${this.safe(pkg.name)}"
include(":app")
`

    const build = `plugins {
    id("com.android.application") version "9.1.0" apply false
    id("org.jetbrains.kotlin.android") version "2.3.10" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.3.10" apply false
}
`

    const props = `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
`

    await fs.ensureDir(proj)
    await fs.ensureDir(path.join(proj, 'app'))
    await fs.writeFile(path.join(proj, 'settings.gradle.kts'), settings)
    await fs.writeFile(path.join(proj, 'build.gradle.kts'), build)
    await fs.writeFile(path.join(proj, 'gradle.properties'), props)
    await fs.writeFile(path.join(proj, 'app/proguard-rules.pro'), '')
  }

  private async man(proj: string, pkg: ManifestBase, web: boolean) {
    const net = web ? '<uses-permission android:name="android.permission.INTERNET" />\n' : ''
    const clear = web ? '        android:usesCleartextTraffic="true"\n' : ''
    const manifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${pkg.id || 'com.example.app'}">

    ${net}    <uses-feature android:name="android.software.leanback" android:required="true" />
    <uses-feature android:name="android.hardware.touchscreen" android:required="false" />

    <application
        android:allowBackup="true"
        android:banner="@drawable/banner"
        android:icon="@android:drawable/sym_def_app_icon"
        android:label="${pkg.name}"
${clear}        android:theme="@android:style/Theme.DeviceDefault.NoActionBar">

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

    const file = path.join(proj, 'app/src/main/AndroidManifest.xml')
    await fs.ensureDir(path.dirname(file))
    await fs.writeFile(file, manifest)
  }

  private async app(proj: string, pkg: ManifestBase, native: boolean) {
    const plugins = native
      ? `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}`
      : `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}`

    const flags = native
      ? `
    buildFeatures {
        compose = true
    }`
      : ''

    const deps = native
      ? `dependencies {
    val bom = platform("androidx.compose:compose-bom:2026.02.01")

    implementation(bom)
    androidTestImplementation(bom)

    implementation("androidx.activity:activity-compose:1.12.4")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.tv:tv-material:1.0.0")
    debugImplementation("androidx.compose.ui:ui-tooling")
}`
      : `dependencies {
    implementation("androidx.leanback:leanback:1.0.0")
}`

    const build = `${plugins}
android {
    namespace = "${pkg.id || 'com.example.app'}"
    compileSdk = 34

    defaultConfig {
        applicationId = "${pkg.id || 'com.example.app'}"
        minSdk = 21
        targetSdk = 34
        versionCode = 1
        versionName = "${pkg.version}"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
${flags}

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }
}

${deps}
`

    await fs.writeFile(path.join(proj, 'app/build.gradle.kts'), build)
  }

  private async res(proj: string) {
    const banner = `<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <solid android:color="#10151E" />
    <corners android:radius="18dp" />
</shape>
`

    const file = path.join(proj, 'app/src/main/res/drawable/banner.xml')
    await fs.ensureDir(path.dirname(file))
    await fs.writeFile(file, banner)
  }

  private async webKt(proj: string, pkg: ManifestBase) {
    const id = pkg.id || 'com.example.app'
    const main = `package ${id}

import android.app.Activity
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val web = WebView(this)
        setContentView(web)

        val set: WebSettings = web.settings
        set.javaScriptEnabled = true
        set.domStorageEnabled = true
        set.allowFileAccess = true

        web.loadUrl("file:///android_asset/www/index.html")
    }
}
`

    const file = path.join(proj, `app/src/main/java/${id.replace(/\./g, '/')}/MainActivity.kt`)
    await fs.ensureDir(path.dirname(file))
    await fs.writeFile(file, main)
  }

  private async nativeKt(proj: string, pkg: ManifestBase) {
    const id = pkg.id || 'com.example.app'
    const main = `package ${id}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.tv.material3.Button
import androidx.tv.material3.MaterialTheme
import androidx.tv.material3.Surface
import androidx.tv.material3.Text

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(Color(0xFF05070A))
                            .padding(48.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFF10151E), RoundedCornerShape(28.dp))
                                .padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(20.dp),
                        ) {
                            Text(
                                text = "${pkg.name}",
                                style = MaterialTheme.typography.displayMedium,
                                textAlign = TextAlign.Center,
                            )
                            Text(
                                text = "Android native mode uses Kotlin and Compose for TV instead of WebView.",
                                style = MaterialTheme.typography.bodyLarge,
                                textAlign = TextAlign.Center,
                                color = Color(0xFFD4D7DD),
                            )
                            Button(onClick = {}) {
                                Text("Ready")
                            }
                        }
                    }
                }
            }
        }
    }
}
`

    const file = path.join(proj, `app/src/main/java/${id.replace(/\./g, '/')}/MainActivity.kt`)
    await fs.ensureDir(path.dirname(file))
    await fs.writeFile(file, main)
  }

  private async cmd(proj: string) {
    if (await fs.pathExists(path.join(proj, 'gradlew'))) {
      return './gradlew'
    }

    if (await this.has('gradle')) {
      return 'gradle'
    }

    return null
  }

  private async has(cmd: string) {
    try {
      await execa(cmd, ['--version'])
      return true
    } catch {
      return false
    }
  }

  private apk(options: BuildOptions) {
    return options.mode === 'native' ? 'app-native.apk' : 'app.apk'
  }

  private safe(name: string) {
    return name.replace(/[^a-z0-9._-]/gi, '-')
  }

  private async pkg(): Promise<ManifestBase> {
    try {
      const pkg = await fs.readJson('package.json')
      return {
        id: pkg.androidAppId || this.id(pkg.name),
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

  private id(name: string) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.+|\.+$/g, '')
      .replace(/\.\.+/g, '.')

    return `com.tablejs.${slug || 'app'}`
  }
}
