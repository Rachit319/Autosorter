

# AutoSort AI

An AI-powered desktop application for intelligent file organization using Machine Learning and customizable rule-based automation.

---

# 📋 Project Overview

**AutoSort AI** is a cross-platform desktop application that intelligently organizes files and folders using Artificial Intelligence and customizable rule-based automation. Built with **Electron**, **Node.js**, and **TypeScript**, the application helps users automatically categorize, sort, and manage files stored on their computers, reducing manual effort while maintaining an organized filesystem.

The system combines traditional rule-based sorting with an intelligent Machine Learning classifier capable of recognizing different file types using extensions, metadata, file signatures (magic bytes), and content analysis. Users can preview all file movements before execution through a secure **Dry Run** mode, ensuring complete transparency and preventing accidental file modifications.

AutoSort AI also includes filesystem utilities, performance optimizations through caching, database-backed statistics, and Electron IPC communication between the desktop interface and backend services, providing a fast, secure, and user-friendly file organization experience.

---

# 🎯 Key Features

## 👤 For Users

### Intelligent File Organization

Automatically scans selected directories and organizes files into appropriate folders based on AI predictions or predefined sorting rules.

### AI-Based File Classification

Uses Machine Learning techniques to classify files using:

* File extensions
* File signatures (magic bytes)
* Metadata
* Filename patterns
* File content analysis

This provides accurate and intelligent categorization of files.

### Rule-Based Sorting

Allows users to organize files according to custom sorting rules without relying on AI.

### Preview (Dry Run) Mode

Displays every planned file movement before making changes, allowing users to safely verify the organization process before execution.

### Multiple Organization Methods

Supports organizing files by:

* 📁 Category
* 📄 File Type
* 📅 Date
* 📦 File Size

### Real-Time Progress Tracking

Displays:

* Total files scanned
* Files organized
* Processing duration
* Categories created
* Errors encountered during execution

### Safe File Operations

Includes built-in validation to prevent unintended file modifications and automatically restores Dry Run protection after preview operations.

---

## 📂 File Management Utilities

AutoSort AI provides a complete backend for secure filesystem management with support for:

* Recursive directory scanning
* File copy operations
* File move operations
* Rename files
* Delete files
* Automatic folder creation
* File hashing (MD5, SHA-1, SHA-256)
* Archive extraction
* File compression
* Metadata extraction
* File reading and writing
* Quarantine support for suspicious files

---

## 🤖 Machine Learning Features

The integrated ML engine analyzes files using multiple characteristics, including:

* File extensions
* File signatures (magic bytes)
* Binary vs text content detection
* Filename characteristics
* File size
* Presence of numbers or special characters
* Metadata analysis

The classifier returns:

* Predicted category
* Confidence score
* Classification reason
* Extracted file features

Batch classification is also supported for improved performance when processing large directories.

---

## 🖥️ Electron Desktop Integration

The application is built as a native desktop application using Electron and provides:

* Native desktop interface
* Cross-platform compatibility
* IPC communication between frontend and backend
* Development and production modes
* Automatic fallback loading
* Application menu integration
* Secure preload architecture
* Context isolation for enhanced security

---

## ⚡ Performance Features

AutoSort AI includes several optimizations for faster processing:

* Directory scan caching
* File hash caching
* Batch ML classification
* Recursive scanning optimization
* Maximum recursion depth protection
* Efficient filesystem traversal
* Background processing

These optimizations improve responsiveness while organizing large numbers of files.

---

# 🏗️ Architecture

## System Overview

```text
┌────────────────────────────────────────────────────────────┐
│                Electron Desktop Application                │
│              (Cross-Platform Desktop Client)               │
│                                                            │
│  • React/User Interface                                    │
│  • Electron Renderer                                       │
│  • File Preview                                            │
│  • User Controls                                           │
└──────────────────────┬─────────────────────────────────────┘
                       │
                 IPC Communication
                       │
                       ▼
┌────────────────────────────────────────────────────────────┐
│                 Electron Main Process                      │
│                                                            │
│  • AutoSort Core                                           │
│  • IPC Handlers                                            │
│  • File System Manager                                     │
│  • Machine Learning Classifier                             │
│  • Database Manager                                        │
└──────────────────────┬─────────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────────┐
│                  Local File System                         │
│                                                            │
│  • Directory Scanning                                      │
│  • File Classification                                     │
│  • Folder Creation                                         │
│  • File Movement                                           │
│  • Compression                                             │
│  • Metadata Extraction                                     │
└────────────────────────────────────────────────────────────┘
```

---

## Processing Workflow

1. User selects a directory to organize.
2. Electron sends the request through IPC to the backend.
3. The File System Manager scans all files recursively.
4. Files are classified using either:

   * AI / Machine Learning Classification
   * Rule-Based Classification
5. A preview of all planned file movements is generated.
6. If approved, folders are created automatically.
7. Files are safely moved into their categorized locations.
8. Statistics and history are stored for reporting and future analysis.

---

# 🛠️ Technology Stack

## Desktop Application

* Electron
* Node.js
* TypeScript
* JavaScript

---

## Core Backend

* Electron Main Process
* IPC Communication
* Node.js FileSystem API
* Path Module
* Crypto Module
* HTTP & TCP Networking

---

## Artificial Intelligence

* Custom Machine Learning Classifier
* Feature Extraction
* File Signature Detection
* Metadata Analysis
* Content Analysis

---

## File System Operations

* Node.js File System API
* Recursive Directory Scanner
* File Compression
* Archive Extraction
* File Hashing
* Metadata Reader

---

## Database

* Local Database Manager
* Job History Storage
* Classification History
* Statistics Management

---

## Development Tools

* TypeScript
* Source Maps
* Electron Development Environment
* Context Isolation
* Secure Preload Scripts

---

# 📌 Highlights

* ✅ AI-powered intelligent file organization
* ✅ Rule-based and Machine Learning classification
* ✅ Safe Dry Run preview mode
* ✅ Native cross-platform Electron desktop application
* ✅ Fast filesystem scanning with caching
* ✅ Secure file operations and IPC communication
* ✅ Built-in compression, hashing, metadata extraction, and quarantine support
* ✅ Scalable architecture designed for organizing thousands of files efficiently
