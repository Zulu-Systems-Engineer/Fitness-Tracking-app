cd "F:\Mobile Apps\fitness tracking app"
cd fitness-tracker\apps\web
pnpm add -D terser
pnpm run build
cd ..\..\..
firebase deploy --only hosting




