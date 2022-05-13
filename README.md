# Raumplan 2.0

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)

## Was ist der Raumplan

Den Raumplan habe ich zusammen mit David Beyer in meinem zweiwöchigen Praktikum bei Seibert Media entwickelt. Er ist dazu gedacht, dass Mitarbeiter bei Seibert Media einen Überblick über die Büroflächen und Tische bekommen. Man kann so einfach Personen finden oder schauen, wer an einem Tisch sitzt.

## Was ist anders in der 2.0 version?

Der neue Tischplan ist in React geschrieben und hat im Vergleich zum alten Tischplan deutlich bessere Funktionen. Die Suchfunktion kann mehr dinge finden,

## Wie funktioniert das Tisch verschieben?

Jeder Tisch ist child von einem einem `react-draggable`, welches ursprünglich links oben bei (0|0) ist. Wenn der Tisch nun verschoben wird, wird immer, wenn das react-draggable losgelassen wird die x und y Koordinaten auf den Tisch übertragen, damit dieser an der Richtigen stelle ist. Wenn der Tisch gespeichert wird, wird die Relative Verschiebung mit der normalen Position verrechnet und gespeichert.

## Besonderheit: resource friendly

Ich habe den Tischplan so geschrieben, dass nur die Ressourcen geholt werden, die wirklich benötigt werden. So werden beim initial page load nur die Daten der Aktuellen Location (Tischgröße), die Räume, Teams, Tische und das Grundriss-Bild von der aktuellen Location geladen. Die Benutzer werden erst geladen, wenn man mit der Maus über einen Tisch hovered und gespeichert um später wieder verwendet werden zu können.

## Backend

Das Backend für den Raumplan ist [hier](https://github.com/NilsGke/raumplan2Server). Es basiert auf einem Node server und eine SQL-Datenbank, die alle Tische, Locations, Teams usw... hält.
