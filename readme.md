# Process Compendium

This project is recreating the entire process compendium

## Exporting Video

To export video from cCapture pngs, use this script

```
ffmpeg -r 60 -f image2 -s 200x200 -i "%07d.png" -vcodec libx264 -crf 17 -pix_fmt yuv420p output.mp4
```
