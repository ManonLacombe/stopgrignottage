#!/usr/bin/env bash
#
# Construit l'APK StopGrignottage sans Gradle ni Android Studio.
#
# Prérequis : SDK Android (build-tools 34+, platform android-34) et un JDK 17 ou plus.
#   ANDROID_SDK_ROOT  chemin du SDK            (défaut : ~/Android/Sdk)
#   JAVA_HOME         chemin du JDK            (défaut : JBR livré avec Android Studio)
#
# Usage : ./build.sh            construit build/StopGrignottage.apk
#         ./build.sh --key      crée d'abord la clé de signature si elle manque
#
# La clé de signature (android/signing/) est volontairement exclue de git :
# sans elle, impossible de publier une mise à jour qui s'installe par-dessus l'app
# déjà installée. Conserve-la précieusement et sauvegarde-la.

set -euo pipefail

cd "$(dirname "$0")"

SDK="${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}"
BUILD_TOOLS="${BUILD_TOOLS:-$SDK/build-tools/34.0.0}"
PLATFORM="$SDK/platforms/android-34/android.jar"
JAVA_HOME="${JAVA_HOME:-$HOME/Téléchargements/android-studio/jbr}"

KEYSTORE="signing/stopgrignottage.jks"
KEYPASS_FILE="signing/password.txt"
ALIAS="stopgrignottage"

for tool in aapt2 d8 zipalign apksigner; do
  [ -x "$BUILD_TOOLS/$tool" ] || { echo "Outil manquant : $BUILD_TOOLS/$tool" >&2; exit 1; }
done
[ -f "$PLATFORM" ] || { echo "android.jar introuvable : $PLATFORM" >&2; exit 1; }
[ -x "$JAVA_HOME/bin/javac" ] || { echo "JDK introuvable : $JAVA_HOME" >&2; exit 1; }

export PATH="$JAVA_HOME/bin:$BUILD_TOOLS:$PATH"

if [ "${1:-}" = "--key" ] || [ ! -f "$KEYSTORE" ]; then
  mkdir -p signing
  if [ ! -f "$KEYPASS_FILE" ]; then
    head -c 18 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 24 > "$KEYPASS_FILE"
    chmod 600 "$KEYPASS_FILE"
  fi
  PASS="$(cat "$KEYPASS_FILE")"
  if [ ! -f "$KEYSTORE" ]; then
    echo "Création de la clé de signature…"
    keytool -genkeypair -v \
      -keystore "$KEYSTORE" -storetype PKCS12 \
      -alias "$ALIAS" -keyalg RSA -keysize 2048 -validity 10950 \
      -storepass "$PASS" -keypass "$PASS" \
      -dname "CN=Manon Lacombe, O=StopGrignottage, C=FR" >/dev/null
  fi
fi

PASS="$(cat "$KEYPASS_FILE")"

echo "1/6  Nettoyage"
rm -rf build
mkdir -p build/classes build/gen build/dex

echo "2/6  Ressources"
aapt2 compile --dir res -o build/res.zip
aapt2 link \
  -o build/base.apk \
  -I "$PLATFORM" \
  --manifest AndroidManifest.xml \
  -R build/res.zip \
  --java build/gen \
  --min-sdk-version 26 \
  --target-sdk-version 34 \
  --version-code 1 \
  --version-name 1.0 \
  --auto-add-overlay

echo "3/6  Java"
find src build/gen -name '*.java' > build/sources.txt
javac --release 8 -nowarn -classpath "$PLATFORM" -d build/classes @build/sources.txt

echo "4/6  Dex"
jar cf build/classes.jar -C build/classes .
d8 --lib "$PLATFORM" --min-api 26 --output build/dex build/classes.jar

echo "5/6  Empaquetage"
python3 - <<'PY'
import shutil, zipfile
shutil.copy('build/base.apk', 'build/unsigned.apk')
with zipfile.ZipFile('build/unsigned.apk', 'a', zipfile.ZIP_DEFLATED) as z:
    z.write('build/dex/classes.dex', 'classes.dex')
PY
zipalign -f -p 4 build/unsigned.apk build/aligned.apk

echo "6/6  Signature"
apksigner sign \
  --ks "$KEYSTORE" --ks-key-alias "$ALIAS" \
  --ks-pass "pass:$PASS" --key-pass "pass:$PASS" \
  --out build/StopGrignottage.apk build/aligned.apk
apksigner verify --print-certs build/StopGrignottage.apk | head -3

cp build/StopGrignottage.apk ../StopGrignottage.apk
echo
echo "APK prêt : $(cd .. && pwd)/StopGrignottage.apk ($(du -h ../StopGrignottage.apk | cut -f1))"
