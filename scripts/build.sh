set -e

verbose() {
  echo "$@" >&2
  "$@"
}

VERSION="$(node -p -e 'require("./extension/manifest.json").version')"
test -n "$VERSION"

mkdir -p dist
FILE="dist/pushpin-${VERSION}.zip"

test -e "$FILE" && rm "$FILE"
cd extension/
verbose zip ../"$FILE" -r .
