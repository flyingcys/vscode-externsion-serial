# Serial Studio VSCode Extension

A powerful VSCode extension for serial port data visualization and analysis, inspired by and based on the [Serial Studio](https://serial-studio.com/) desktop application.

## 🚀 Features

- **Multi-Protocol Support**: Connect to devices via Serial Port (UART), Network (TCP/UDP), and Bluetooth LE
- **Real-time Visualization**: High-performance data visualization with 20Hz+ update rates
- **13 Widget Types**: Comprehensive set of visualization components including plots, gauges, GPS maps, and more
- **Project Management**: Import/export project configurations compatible with Serial Studio
- **Data Export**: Export data in multiple formats (CSV, JSON, Excel, XML)
- **Extensible Architecture**: Plugin system for custom drivers and widgets

## 📦 Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Serial Studio"
4. Click Install

### Manual Installation
1. Download the latest `.vsix` file from [Releases](https://github.com/Serial-Studio/vscode-extension/releases)
2. Open VS Code
3. Run `Extensions: Install from VSIX...` command
4. Select the downloaded file

## 🎯 Quick Start

### 1. Connect to Device
```bash
Ctrl+Shift+P → "Serial Studio: Connect to Device"
```

### 2. Open Dashboard
```bash
Ctrl+Shift+P → "Serial Studio: Open Dashboard"
```

### 3. Configure Data Visualization
- Use the built-in project editor
- Or import existing Serial Studio project files

## 🏗️ Architecture

The extension follows a modular architecture based on Serial Studio's design:

```
┌─────────────────────────────────────────────────────────────┐
│                    VSCode Extension Host                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  IO Manager     │  │ Project Manager │  │Message Bridge│ │
│  │  - HAL Drivers  │  │ - JSON Config   │  │ - Extension  │ │
│  │  - Frame Reader │  │ - Validation    │  │ - Webview    │ │
│  │  - Data Buffer  │  │ - Import/Export │  │ - Protocol   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Webview (Vue3)                       │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │ │
│  │  │  Dashboard  │  │ Data Parser │  │ Widget System   │ │ │
│  │  │  Manager    │  │ - JS Engine │  │ - 13 Components │ │ │
│  │  │             │  │ - VM2 Safe  │  │ - Real-time     │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Configuration

### Extension Settings

```json
{
  "serialStudio.performance.updateFrequency": 20,
  "serialStudio.performance.maxDataPoints": 10000,
  "serialStudio.communication.autoReconnect": true,
  "serialStudio.ui.theme": "auto"
}
```

### Device Configuration

```typescript
{
  "type": "uart",
  "port": "/dev/ttyUSB0",
  "baudRate": 115200,
  "dataBits": 8,
  "stopBits": 1,
  "parity": "none",
  "flowControl": "none"
}
```

## 📊 Supported Widgets

| Widget | Description | Use Case |
|--------|-------------|----------|
| Plot | Real-time line charts | Sensor readings over time |
| MultiPlot | Multiple curves on one chart | Comparing multiple signals |
| Gauge | Circular gauge display | Temperature, pressure readings |
| Bar | Horizontal/vertical bars | Level indicators |
| Compass | Directional compass | Heading, orientation |
| Accelerometer | 3-axis acceleration display | Motion sensing |
| Gyroscope | 3-axis gyroscope display | Rotation sensing |
| GPS | Map with GPS coordinates | Location tracking |
| LED | LED panel display | Status indicators |
| DataGrid | Tabular data display | Raw data viewing |
| Terminal | Text console output | Debug messages |
| FFT | Frequency domain analysis | Signal analysis |
| Plot3D | 3D visualization | Spatial data |

## 🔌 Supported Protocols

### Serial Port (UART)
- All standard baud rates (9600 - 921600)
- Configurable data bits, stop bits, parity
- Hardware/software flow control
- Auto-reconnection support

### Network (TCP/UDP)
- Client and server modes
- IPv4 and IPv6 support
- Configurable timeouts
- Connection pooling

### Bluetooth LE
- Device discovery and pairing
- Service and characteristic access
- Automatic reconnection
- Low energy optimization

## 🧪 Development

### Prerequisites
- Node.js 18+
- VS Code 1.74+
- Git

### Setup
```bash
git clone https://github.com/Serial-Studio/vscode-extension
cd vscode-extension
npm install
```

### Development Commands
```bash
npm run compile        # Compile TypeScript
npm run watch         # Watch mode compilation
npm run test          # Run unit tests
npm run test:coverage # Run tests with coverage
npm run lint          # Run ESLint
npm run package       # Build production package
```

### Testing
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Architecture Guidelines

#### 1. Modular Design
- Each module has a single responsibility
- Clear interfaces between modules
- Dependency injection for testability

#### 2. Performance Requirements
- 20Hz+ real-time updates
- <50ms processing latency
- <500MB memory usage
- 60fps UI rendering

#### 3. Code Quality
- TypeScript strict mode
- 90%+ test coverage
- ESLint + Prettier formatting
- Complexity < 10

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- Follow TypeScript best practices
- Maintain test coverage above 90%
- Use conventional commit messages
- Document public APIs

## 📚 Documentation

- [API Reference](docs/api/README.md)
- [Widget Development Guide](docs/widgets/README.md)
- [Driver Development Guide](docs/drivers/README.md)
- [Project Configuration](docs/project-config.md)

## 🐛 Troubleshooting

### Common Issues

#### Serial Port Access
```bash
# Linux: Add user to dialout group
sudo usermod -a -G dialout $USER

# macOS: No additional setup required

# Windows: Ensure driver is installed
```

#### Performance Issues
- Reduce update frequency in settings
- Limit maximum data points
- Close unused widgets
- Check available system memory

### Debug Mode
Enable debug logging in VS Code settings:
```json
{
  "serialStudio.debug": true
}
```

## 📄 License

This project is dual-licensed:
- **GPL-3.0-only** for open source builds
- **Commercial License** for builds with Pro features

See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [Serial Studio](https://serial-studio.com/) - Original desktop application
- [Vue.js](https://vuejs.org/) - Frontend framework
- [Chart.js](https://www.chartjs.org/) - Charting library
- [Three.js](https://threejs.org/) - 3D visualization
- [VS Code Extension API](https://code.visualstudio.com/api) - Extension platform

## 📞 Support

- [GitHub Issues](https://github.com/Serial-Studio/vscode-extension/issues)
- [Discord Community](https://discord.gg/serialstudio)
- [Documentation](https://docs.serial-studio.com/vscode-extension)
- [Email Support](mailto:support@serial-studio.com)

---

Made with ❤️ by the Serial Studio team