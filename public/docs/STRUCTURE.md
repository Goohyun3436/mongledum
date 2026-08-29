폴더 구조 `public/docs`

```txt
public/docs/
└── 2026/
    ├── 001-욕망/
    │   ├── album.txt
    │   ├── cover.png
    │   ├── 001-곡명/
    │   │   ├── music.txt
    │   │   ├── essay.txt
    │   │   └── cover.png
    │   ├── 002-뜨리/
    │   │   ├── music.txt
    │   │   ├── essay.txt
    │   │   └── cover.png
    │   └── 003-비빕/
    │       ├── music.txt
    │       └── cover.png
    └── 002-앨범명/
        ├── album.txt
        └── cover.png
```

`index.json`은 사용하지 않습니다. 연도, 앨범, 콘텐츠는 폴더명으로 자동 인식합니다.

- 연도: `YYYY`
- 앨범: `{순서}-{앨범명}`
- 콘텐츠: `{순서}-{콘텐츠명}`
- 화면 제목과 정렬 순서는 폴더명을 기준으로 합니다.

<br />

앨범 정보 `album.txt` & 커버 이미지 `cover.png`

```txt
release_date: 2026-08-29
---
각자가 숨기고 있던 마음을 음악과 글로 기록한 앨범입니다.

서로 다른 목소리가 하나의 주제를 바라봅니다.
```

<br />

곡 정보 `music.txt`

```txt
title: 음악 페이지에 표시할 곡 제목
composition: 구현, 박재욱, 전형우
lyrics: 구현, 박재욱
date: 2026-08-29
youtube: https://youtu.be/example
---
곡에 대한 설명입니다.
```

<br />

에세이 정보 `essay.txt`

```txt
name: 박재욱
---
에세이 본문입니다.
```

<br />

규칙

- music.txt가 있으면 Music 페이지에 표시
- essay.txt가 있으면 Essay 페이지에 표시
- music.txt의 title이 있으면 Music 페이지에서 폴더명과 다른 곡 제목 사용
- music.txt의 title이 비어 있거나 없으면 콘텐츠 폴더명의 제목 사용
- music.txt의 composition에는 작곡가를 쉼표(`,`)로 구분해 작성
- music.txt의 lyrics에는 작사가를 쉼표(`,`)로 구분해 작성
- 콘텐츠 cover.png가 있으면 곡 커버로 사용
- 콘텐츠 커버가 없으면 앨범의 cover.png 사용
- 새 연도, 앨범, 콘텐츠는 폴더 추가만으로 자동 인식
