/**
 * English (US) Translation Messages
 * 英语（美国）翻译消息
 */

import type { TranslationMessages } from '../types/I18nDef';

export const messages: TranslationMessages = {
  // 通用
  common: {
    ok: 'OK',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    remove: 'Remove',
    clear: 'Clear',
    reset: 'Reset',
    refresh: 'Refresh',
    loading: 'Loading...',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    success: 'Success',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    apply: 'Apply',
    import: 'Import',
    export: 'Export',
    settings: 'Settings',
    about: 'About',
    help: 'Help',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    copy: 'Copy',
    paste: 'Paste',
    cut: 'Cut',
    undo: 'Undo',
    redo: 'Redo'
  },

  // 应用程序
  app: {
    name: 'Serial Studio',
    version: 'Version {version}',
    copyright: 'Copyright © {year} {author}',
    allRightsReserved: 'All Rights Reserved',
    website: 'Website',
    reportBug: 'Report Bug',
    checkUpdates: 'Check for Updates',
    donate: 'Donate',
    acknowledgements: 'Acknowledgements'
  },

  // Error Handling
  error: {
    dialog: {
      title: 'Error Details',
      suggestions: 'Suggestions',
      userAction: 'Recommended Action',
      autoRecovery: 'Auto Recovery',
      autoRecoveryMessage: 'System has attempted to automatically recover from this error',
      technicalDetails: 'Technical Details',
      context: 'Error Context',
      retry: 'Retry',
      report: 'Report Issue',
      viewHistory: 'View History',
      retrySuccess: 'Retry successful',
      retryFailed: 'Retry failed',
      reportSuccess: 'Error report copied to clipboard',
      reportFailed: 'Failed to generate error report'
    },
    
    severity: {
      info: 'Info',
      warning: 'Warning',
      error: 'Error',
      critical: 'Critical',
      fatal: 'Fatal'
    },
    
    category: {
      network: 'Network',
      data: 'Data Processing',
      filesystem: 'File System',
      device: 'Device Connection',
      user_input: 'User Input',
      system: 'System',
      config: 'Configuration',
      performance: 'Performance',
      security: 'Security',
      unknown: 'Unknown'
    },
    
    history: {
      title: 'Error History',
      totalErrors: 'Total Errors',
      recoveryRate: 'Recovery Success Rate',
      avgRecoveryTime: 'Average Recovery Time',
      clear: 'Clear History',
      clearConfirm: 'Are you sure you want to clear all error history?',
      clearSuccess: 'Error history cleared successfully',
      filterBySeverity: 'Filter by Severity',
      filterByCategory: 'Filter by Category',
      search: 'Search Errors',
      time: 'Time',
      severity: 'Severity',
      category: 'Category',
      columnTitle: 'Title',
      message: 'Message',
      actions: 'Actions'
    },
    
    notification: {
      details: 'Details'
    }
  },

  // Loading States
  loading: {
    title: 'Loading',
    cancel: 'Cancel',
    retry: 'Retry',
    viewHistory: 'View History',
    subProgress: 'Sub Progress',
    
    // Loading types
    types: {
      spinner: 'Spinner',
      progress: 'Progress Bar',
      skeleton: 'Skeleton Screen',
      dots: 'Dots Animation',
      pulse: 'Pulse Effect',
      wave: 'Wave Effect'
    },
    
    // Loading status
    status: {
      idle: 'Idle',
      loading: 'Loading',
      success: 'Success',
      error: 'Error',
      cancelled: 'Cancelled'
    },
    
    // Priority levels
    priority: {
      low: 'Low Priority',
      medium: 'Medium Priority',
      high: 'High Priority',
      critical: 'Critical Priority'
    },
    
    // Common loading messages
    messages: {
      connecting: 'Connecting...',
      processing: 'Processing data...',
      saving: 'Saving...',
      loading: 'Loading...',
      exporting: 'Exporting...',
      importing: 'Importing...',
      uploading: 'Uploading...',
      downloading: 'Downloading...',
      initializing: 'Initializing...',
      configuring: 'Configuring...',
      validating: 'Validating...',
      analyzing: 'Analyzing...'
    },
    
    // Progress descriptions
    progress: {
      preparing: 'Preparing...',
      processing: 'Processing... {current}/{total}',
      completing: 'Almost done...',
      finalizing: 'Finalizing...',
      success: 'Operation completed',
      failed: 'Operation failed',
      cancelled: 'Operation cancelled'
    },
    
    // History
    history: {
      title: 'Loading History',
      noHistory: 'No history available',
      clear: 'Clear History',
      clearConfirm: 'Are you sure you want to clear all loading history?',
      duration: 'Duration',
      status: 'Status',
      operations: 'Operations',
      completedTasks: 'Completed Tasks',
      failedTasks: 'Failed Tasks',
      cancelledTasks: 'Cancelled Tasks',
      averageDuration: 'Average Duration'
    }
  },

  // 主题
  theme: {
    title: 'Theme',
    light: 'Light',
    dark: 'Dark',
    auto: 'Auto',
    custom: 'Custom',
    default: 'Default',
    iron: 'Iron',
    midnight: 'Midnight',
    switchTheme: 'Switch Theme',
    themeSettings: 'Theme Settings',
    customThemes: 'Custom Themes',
    importTheme: 'Import Theme',
    exportTheme: 'Export Theme',
    deleteTheme: 'Delete Theme',
    themeImported: 'Theme imported successfully',
    themeExported: 'Theme exported successfully',
    themeDeleted: 'Theme deleted successfully',
    invalidTheme: 'Invalid theme file',
    cannotDeleteBuiltIn: 'Cannot delete built-in theme',
    
    // 主题配置新增
    builtinThemes: 'Built-in Themes',
    createCustom: 'Create Custom Theme',
    noCustomThemes: 'No custom themes available',
    options: 'Theme Options',
    followSystem: 'Follow System',
    followSystemDescription: 'Automatically switch between light/dark themes based on system settings',
    animations: 'Theme Animations',
    animationsDescription: 'Enable theme switching and interface transition animations',
    highContrast: 'High Contrast',
    highContrastDescription: 'Enhance interface contrast for better accessibility',
    importExport: 'Import/Export',
    exportAll: 'Export All Themes',
    allThemesExported: 'All themes exported successfully',
    settingsApplied: 'Theme settings applied',
    settingsReset: 'Theme settings reset',
    deleteConfirm: 'Are you sure you want to delete theme "{name}"?',
    
    // 自定义主题编辑器
    createCustomTheme: 'Create Custom Theme',
    editCustomTheme: 'Edit Custom Theme',
    basicInfo: 'Basic Information',
    themeName: 'Theme Name',
    themeNamePlaceholder: 'Enter theme name',
    baseTheme: 'Base Theme',
    colorConfiguration: 'Color Configuration',
    basicColors: 'Basic Colors',
    interfaceColors: 'Interface Colors',
    chartColors: 'Chart Colors',
    plot3dColors: '3D Plot Colors',
    widgetColors: 'Widget Colors',
    preview: 'Preview',
    sampleTitle: 'Sample Theme',
    invalidThemeData: 'Invalid theme data',
    customThemeSaved: 'Custom theme saved successfully',
    unknown: 'Unknown',
    
    // 颜色标签
    colors: {
      text: 'Text Color',
      base: 'Background Color',
      window: 'Window Color',
      accent: 'Accent Color',
      error: 'Error Color',
      alarm: 'Alarm Color',
      button: 'Button Color',
      buttonText: 'Button Text',
      highlight: 'Highlight Color',
      highlightedText: 'Highlighted Text',
      toolbarTop: 'Toolbar Top',
      toolbarBottom: 'Toolbar Bottom',
      toolbarText: 'Toolbar Text',
      toolbarBorder: 'Toolbar Border',
      consoleBase: 'Console Background',
      consoleText: 'Console Text',
      consoleBorder: 'Console Border',
      widgetBase: 'Widget Background',
      widgetText: 'Widget Text',
      widgetBorder: 'Widget Border',
      widgetWindow: 'Widget Window',
      plot3dXAxis: 'X-Axis Color',
      plot3dYAxis: 'Y-Axis Color',
      plot3dZAxis: 'Z-Axis Color',
      plot3dAxisText: 'Axis Text',
      plot3dGridMajor: 'Major Grid',
      plot3dGridMinor: 'Minor Grid',
      plot3dBackgroundInner: 'Inner Background',
      plot3dBackgroundOuter: 'Outer Background'
    }
  },

  // 语言
  language: {
    title: 'Language',
    current: 'Current Language',
    available: 'Available Languages',
    changeLanguage: 'Change Language',
    languageChanged: 'Language changed to {language}',
    autoDetect: 'Auto Detect',
    system: 'System Default',
    autoDetectDescription: 'Automatically select language based on browser or system settings',
    autoDetected: 'Auto-detected language: {language}'
  },

  // 连接
  connection: {
    title: 'Connection',
    connect: 'Connect',
    disconnect: 'Disconnect',
    connected: 'Connected',
    disconnected: 'Disconnected',
    connecting: 'Connecting...',
    connectionFailed: 'Connection failed',
    status: 'Status',
    port: 'Port',
    baudRate: 'Baud Rate',
    dataBits: 'Data Bits',
    stopBits: 'Stop Bits',
    parity: 'Parity',
    flowControl: 'Flow Control',
    device: 'Device',
    protocol: 'Protocol',
    settings: 'Connection Settings',
    auto: 'Auto',
    manual: 'Manual'
  },

  // 数据
  data: {
    title: 'Data',
    received: 'Received',
    sent: 'Sent',
    frames: 'Frames',
    bytes: 'Bytes',
    rate: 'Rate',
    clear: 'Clear Data',
    pause: 'Pause',
    resume: 'Resume',
    record: 'Record',
    stop: 'Stop',
    save: 'Save Data',
    load: 'Load Data',
    export: 'Export Data',
    import: 'Import Data',
    format: 'Format',
    encoding: 'Encoding',
    plainText: 'Plain Text',
    hexadecimal: 'Hexadecimal',
    binary: 'Binary',
    base64: 'Base64'
  },

  // 项目
  project: {
    title: 'Project',
    new: 'New Project',
    open: 'Open Project',
    save: 'Save Project',
    saveAs: 'Save As...',
    close: 'Close Project',
    recent: 'Recent Projects',
    settings: 'Project Settings',
    structure: 'Project Structure',
    groups: 'Groups',
    datasets: 'Datasets',
    actions: 'Actions',
    frameParser: 'Frame Parser',
    validation: 'Validation',
    editor: 'Project Editor',
    template: 'Template',
    templates: 'Project Templates',
    createFromTemplate: 'Create from Template',
    invalid: 'Invalid project',
    loaded: 'Project loaded successfully',
    saved: 'Project saved successfully',
    modified: 'Project has been modified',
    unsavedChanges: 'You have unsaved changes. Do you want to save them?'
  },

  // 仪表板
  dashboard: {
    title: 'Dashboard',
    widgets: 'Widgets',
    layout: 'Layout',
    fullscreen: 'Fullscreen',
    windowed: 'Windowed',
    autoLayout: 'Auto Layout',
    grid: 'Grid',
    list: 'List',
    add: 'Add Widget',
    remove: 'Remove Widget',
    configure: 'Configure Widget',
    resize: 'Resize',
    move: 'Move',
    duplicate: 'Duplicate',
    widget: {
      plot: 'Plot',
      multiplot: 'Multi Plot',
      gauge: 'Gauge',
      bar: 'Bar Chart',
      compass: 'Compass',
      accelerometer: 'Accelerometer',
      gyroscope: 'Gyroscope',
      gps: 'GPS Map',
      led: 'LED Panel',
      dataGrid: 'Data Grid',
      terminal: 'Terminal',
      fft: 'FFT Plot',
      plot3d: '3D Plot'
    }
  },

  // 控制台
  console: {
    title: 'Console',
    send: 'Send',
    clear: 'Clear Console',
    timestamp: 'Timestamp',
    showTimestamp: 'Show Timestamp',
    wordWrap: 'Word Wrap',
    autoScroll: 'Auto Scroll',
    saveLog: 'Save Log',
    loadLog: 'Load Log',
    filter: 'Filter',
    search: 'Search in Console'
  },

  // 设置
  settings: {
    title: 'Settings',
    general: 'General',
    appearance: 'Appearance',
    performance: 'Performance',
    advanced: 'Advanced',
    plugins: 'Plugins',
    about: 'About',
    resetSettings: 'Reset Settings',
    resetConfirm: 'Are you sure you want to reset all settings to defaults?',
    settingsReset: 'Settings have been reset to defaults',
    autoSave: 'Auto Save',
    checkUpdates: 'Check for Updates',
    sendUsageData: 'Send Usage Data',
    enablePlugins: 'Enable Plugins',
    maxFrameRate: 'Max Frame Rate',
    bufferSize: 'Buffer Size',
    threadCount: 'Thread Count',
    dateFormat: 'Date Format',
    numberFormat: 'Number Format',
    language: 'Language Settings',
    theme: 'Theme Settings'
  },

  // 导出
  export: {
    title: 'Export Data',
    format: 'Export Format',
    destination: 'Destination',
    filename: 'File Name',
    options: 'Export Options',
    range: 'Data Range',
    all: 'All Data',
    current: 'Current View',
    timeRange: 'Time Range',
    from: 'From',
    to: 'To',
    includeHeaders: 'Include Headers',
    compression: 'Compression',
    progress: 'Export Progress',
    completed: 'Export completed successfully',
    failed: 'Export failed',
    cancelled: 'Export cancelled',
    csv: 'CSV (Comma-Separated Values)',
    json: 'JSON (JavaScript Object Notation)',
    xml: 'XML (eXtensible Markup Language)',
    excel: 'Excel Workbook',
    binary: 'Binary Data'
  },

  // 错误消息
  errorMessages: {
    generic: 'An error occurred',
    network: 'Network error',
    timeout: 'Operation timed out',
    permission: 'Permission denied',
    notFound: 'Not found',
    invalidInput: 'Invalid input',
    invalidFormat: 'Invalid format',
    fileNotFound: 'File not found',
    cannotConnect: 'Cannot connect to device',
    deviceBusy: 'Device is busy',
    parseError: 'Parse error',
    validationError: 'Validation error',
    unknownError: 'Unknown error occurred'
  },

  // 成功消息
  success: {
    connected: 'Successfully connected',
    disconnected: 'Successfully disconnected',
    saved: 'Saved successfully',
    loaded: 'Loaded successfully',
    exported: 'Exported successfully',
    imported: 'Imported successfully',
    deleted: 'Deleted successfully',
    updated: 'Updated successfully',
    reset: 'Reset successfully'
  },

  // 单位
  units: {
    bytes: 'Bytes',
    kb: 'KB',
    mb: 'MB',
    gb: 'GB',
    bps: 'bps',
    kbps: 'Kbps',
    mbps: 'Mbps',
    hz: 'Hz',
    khz: 'KHz',
    mhz: 'MHz',
    ghz: 'GHz',
    ms: 'ms',
    sec: 's',
    min: 'min',
    hour: 'h',
    day: 'd',
    volt: 'V',
    ampere: 'A',
    watt: 'W',
    celsius: '°C',
    fahrenheit: '°F',
    kelvin: 'K',
    meter: 'm',
    kilometer: 'km',
    inch: 'in',
    foot: 'ft',
    gram: 'g',
    kilogram: 'kg',
    pound: 'lb'
  },

  // 许可证
  license: {
    title: 'License',
    gpl: 'GNU General Public License',
    commercial: 'Commercial License',
    trial: 'Trial Version',
    expired: 'License Expired',
    invalid: 'Invalid License',
    activate: 'Activate License',
    deactivate: 'Deactivate License',
    manage: 'Manage License',
    purchase: 'Purchase License',
    info: 'License Information',
    key: 'License Key',
    email: 'Email',
    name: 'Name',
    company: 'Company',
    expires: 'Expires',
    devices: 'Devices',
    features: 'Features'
  }
};

export default messages;