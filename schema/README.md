# migration

migration には sqldef を用います
https://github.com/k0kubun/sqldef

## Installation

https://github.com/k0kubun/sqldef/releases

のページから対応する psqldef をインストールします。

|チップ|ダウンロードリンク|
|Mac Intel|[psqldef_darwin_amd64.zip](https://github.com/k0kubun/sqldef/releases/download/v0.11.60/psqldef_darwin_amd64.zip)|
|Mac M1|[psqldef_darwin_arm64.zip](https://github.com/k0kubun/sqldef/releases/download/v0.11.60/psqldef_darwin_arm64.zip)|

ダウンロードした zip ファイルを解凍してこの schema ディレクトリに配置します。

# Run

## dry run

`./psqldef -h localhost -U postgres tocre --dry-run < schema.sql`

## run

`./psqldef -h localhost -U postgres tocre < schema.sql`
