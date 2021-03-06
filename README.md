# Ground Station

This project is the ground station software in development to be used with my autonomous drones. It's built using Electron and is meant to comunicate with a drone over a RF link through a virtual serial port. This is a refactor of a set of scripts used during the 2017 [MOSTRATEC](http://mostratec.com.br/en).

:warning: **Keep in mind this is an experimental software and this repo is meant mostly as a logbook** :warning:

## Usage

At the moment this software has only been tested on macOS, however it should work on other platforms. To run you simply need to clone this repo then run: 
```javascript
npm install
npm start
```
And the application should start in fullscreen right away.

## Serial protocol and drone firmware
_Coming soon_

## Science fairs and other prizes
This software hasn't been presented at any science fair, however its old version (together with the drone) already won:

- 2nd place in Electrical Engineering @ [MOSTRATEC 2017](http://mostratec.com.br/en)

The first public demo will be at [FEBRACE 2018](http://febrace.org.br), which will happen from 13 Mar - 15 Mar.

## Licensing
This project is open source as a means of paying forward to the helpful software community. However, bear in mind this software is still used for actively competing at science fairs, so please don't use it if competing at the same fair as me. If in doubt, just open an issue and I'll review it as soon as possible. Derivative work is fair game (e.g. adapting the software to work with an autonomous car), however you must credit the author. 

The code is licensed under GNU GPL v3, therefore:
### You have permission to:

- Use it in commercial work
- Distribute it
- Modify it
- Use it in patented work
- Use it privately

### However, you must:

- Disclose your work's source code
- Provide the license and copyright notice
- Use the same license
- State any changes you've made

###### Copyright (C) 2018 Pedro Henrique Kopper