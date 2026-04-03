# @tablejs/platform

Build tools and platform adapters for Table.js.

## Installation

```bash
npm install -D @tablejs/platform
```

## Usage

```bash
# Build for all platforms
table build --platform all

# Build for specific platform
table build --platform tizen
table build --platform webos
table build --platform android

# Build Android as a native Kotlin + Compose TV project
table build --platform android --mode native
```

## Supported Platforms

- **Tizen** - Samsung Smart TV (.wgt)
- **webOS** - LG Smart TV (.ipk)
- **Android TV** - Android TV WebView (.apk / Gradle project)
- **Android TV Native** - Kotlin + Compose for TV project (`--mode native`)

## License

MIT
