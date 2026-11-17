# FFmpeg recipes for code-generated video

## Frames → master
```bash
ffmpeg -framerate 30 -i frames/f%05d.png -c:v libx264 -crf 16 \
       -pix_fmt yuv420p -movflags +faststart out.mp4
```
`-crf 16` is visually lossless-ish; use `-crf 12` for an intermediate you will
re-encode, `-crf 20` for delivery.

## Vertical 9:16 social master
```bash
ffmpeg -framerate 30 -i graded/f%05d.png \
  -vf "scale=1080:1920:flags=lanczos,format=yuv420p" \
  -c:v libx264 -crf 18 -preset slow -movflags +faststart reel.mp4
```

## Pad / letterbox any source into 9:16 without cropping
```bash
ffmpeg -i in.mp4 -vf "scale=1080:-2,pad=1080:1920:0:(oh-ih)/2:color=black" out.mp4
```

## Synthetic motion blur (cheap, convincing)
Render at 4× frame rate, then blend down:
```bash
ffmpeg -i frames120.mp4 -vf "tmix=frames=4:weights='1 1 1 1',fps=30" blurred.mp4
```

## Speed ramp
```bash
ffmpeg -i in.mp4 -vf "setpts=0.5*PTS" -an fast.mp4          # 2x
ffmpeg -i in.mp4 -vf "minterpolate=fps=60,setpts=2*PTS" slowmo.mp4
```

## Crossfade two shots
```bash
ffmpeg -i a.mp4 -i b.mp4 -filter_complex \
  "[0][1]xfade=transition=fade:duration=0.5:offset=3.5" out.mp4
```

## Grade approximation in FFmpeg (when you can't grade frames)
```bash
ffmpeg -i in.mp4 -vf \
 "eq=contrast=1.12:saturation=1.10,\
  colorbalance=rs=.03:bs=-.03:rh=.05:bh=-.04,\
  vignette=angle=PI/5,\
  noise=alls=6:allf=t" out.mp4
```

## Extract frames for inspection / contact sheet
```bash
ffmpeg -i in.mp4 -vf "fps=1/2,scale=360:-1" f%03d.png
montage f*.png -tile 6x -geometry +4+4 -background '#111' miff:- \
  | convert - -resize 1400x sheet.png      # resize AFTER montage, or it explodes
```

## Loop a short render into a longer clip
```bash
ffmpeg -stream_loop 5 -i loop.mp4 -c copy long.mp4
```

## Transparent overlay (motion graphic over footage)
Render RGBA PNGs, then:
```bash
ffmpeg -i bg.mp4 -framerate 30 -i ov/f%05d.png \
  -filter_complex "[0][1]overlay=0:0:format=auto" -c:a copy out.mp4
```
