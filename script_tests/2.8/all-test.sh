SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

echo "******"
echo "* Test application funcionality"
echo "******"
echo ""
sh $SCRIPT_DIR/app-fun.sh
echo ""
echo "******"
echo "* Test persistence"
echo "******"
echo ""
sh $SCRIPT_DIR/test-persistence.sh 
echo ""
echo "******"
echo "* Verify db conection"
echo "******"
echo ""
sh $SCRIPT_DIR/verify-db.sh
