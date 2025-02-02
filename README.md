# nut.js (Native UI Toolkit) [![Build Status](https://travis-ci.com/nut-tree/nut.js.svg?branch=master)](https://travis-ci.com/nut-tree/nut.js) [![Greenkeeper badge](https://badges.greenkeeper.io/nut-tree/nut.js.svg)](https://greenkeeper.io/) [![SonarCloud badge](https://sonarcloud.io/api/project_badges/measure?project=nut-tree%3Anut.js&metric=alert_status)](https://sonarcloud.io/dashboard?id=nut-tree%3Anut.js) [![SonarCloud Coverage](https://sonarcloud.io/api/project_badges/measure?project=nut-tree%3Anut.js&metric=coverage)](https://sonarcloud.io/component_measures?id=nut-tree%3Anut.js&metric=coverage)
<p align="center">
Native UI testing / automation with node.js
</p>
<br/>
<p align="center">
	<a target="_blank" href="https://robotjs.io/">
		<img src="https://img.shields.io/badge/Built_with-ROBOT-C86414.svg?style=flat-square" alt="Built with Robot" />
	</a>
	<a target="_blank" href="https://github.com/justadudewhohacks/opencv4nodejs">
		<img src="https://img.shields.io/badge/Built_with-opencv4nodejs-C86414.svg?style=flat-square" alt="Built with opencv4nodejs" />
</p>

# About

<p align="center">
    <img src=".gfx/nut.png" alt="logo" width="200"/>
</p>

`nut.js` is a cross-platform native UI testing tool.

It allows for native UI interactions via keyboard and / or mouse,
but additionally gives you the possibility to navigate the screen based on image matching.

# Sample

The following snippet shows a valid NUT example (on macOS)

```js
"use strict";

const { keyboard, Key, mouse, left, right, up, down } = require("@nut-tree/nut-js");

const square = async () => {
  await mouse.move(right(500));
  await mouse.move(down(500));
  await mouse.move(left(500));
  await mouse.move(up(500));
};

const openSpotlight = async () => {
  await keyboard.pressKey(Key.LeftSuper);
  await keyboard.pressKey(Key.Space);
  await keyboard.releaseKey(Key.Space);
  await keyboard.releaseKey(Key.LeftSuper);
};

describe("Basic test", () => {
  it("Should run a simple test", async () => {
    await square();
    await openSpotlight();
    await keyboard.type("calculator");
    await keyboard.type(Key.Return);
  });
});

```

# Installation

While `nut.js` comes with a pre-built version of OpenCV for your respective target platform, it currently still requires some 3rd-party dependencies to generate `node` bindings.
This setup will be enhanced in the future so no additional packages have to be installed on a target system.

Until then, the following tools / libraries need to be installed in order to use `nut.js`:

## Prerequisites

The installation process comes with a pre-built version of OpenCV for the respective target platform.
It's not required to manually build or install OpenCV, but the installation process has some 3rd-party dependencies.

#### Windows

In order to install `nut.js` on Windows, [Windows Build Tools](https://www.microsoft.com/en-us/download/details.aspx?id=48159) and [Python 2](https://www.python.org/downloads/windows/) are required.
You can either set them up manually, or install them via npm:

```bash
npm install --global windows-build-tools
```

or

```bash
yarn global add windows-build-tools
```

#### macOS

On macOS, Xcode command line tools are required.
You can install them by running
```bash
xcode-select --install
```

#### Linux

Depending on your distribution, Linux setups may differ.

In general, `nut.js` requires

- Python 2
- g++
- make
- libXtst
- libPng

Installation on `*buntu` distributions:
```bash
sudo apt-get install build-essential python libxtst-dev libpng++-dev
```

Setups on other distributions might differ.

For reference, please see:
 
- [opencv4nodejs](https://github.com/justadudewhohacks/opencv4nodejs#how-to-install)
- [robotjs](http://robotjs.io/docs/building)

## Install `nut.js`

Running 

```bash
npm i @nut-tree/nut-js
```

or

```bash
yarn add @nut-tree/nut-js
```

will install nut.js and its required dependencies.


# Examples

[nut-tree/trailmix](https://github.com/nut-tree/trailmix) contains a set of ready to use examples which demo the usage ot nut.js.

# Modules

This list gives an overview on currently implemented and planned functionality.
It's work in progress and will undergo constant modification.

## Clipboard

- [x] Copy text to clipboard
- [x] Paste text from clipboard

## Keyboard

- [x] Support for standard US keyboard layout
- [x] Support for German special characters

## Mouse

- [x] Support for mouse movement
- [x] Support for mouse scroll
- [x] Configurable movement speed
- [x] Mouse drag

## Process

- [ ] Retrieve the region of a process window

## Screen

- [x] findOnScreen
- [x] waitFor
- [x] Hooks to trigger actions based on images

## Integration

- [x] Jest
