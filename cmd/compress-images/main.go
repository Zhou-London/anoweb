package main

import (
	"bytes"
	"fmt"
	"image/jpeg"
	"image/png"
	"os"
	"path/filepath"
	"strings"

	"github.com/disintegration/imaging"
)

const (
	maxDim      = 1920
	jpegQuality = 85
)

func main() {
	dir := "/var/www/images/anoweb"
	if len(os.Args) > 1 {
		dir = os.Args[1]
	}

	entries, err := os.ReadDir(dir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "read dir: %v\n", err)
		os.Exit(1)
	}

	var totalBefore, totalAfter int64
	var compressed, unchanged, skipped int

	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		ext := strings.ToLower(filepath.Ext(e.Name()))
		if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
			continue
		}

		path := filepath.Join(dir, e.Name())
		info, err := e.Info()
		if err != nil {
			fmt.Fprintf(os.Stderr, "  skip %s: %v\n", e.Name(), err)
			skipped++
			continue
		}
		before := info.Size()
		totalBefore += before

		img, err := imaging.Open(path, imaging.AutoOrientation(true))
		if err != nil {
			fmt.Fprintf(os.Stderr, "  skip %s: decode failed: %v\n", e.Name(), err)
			skipped++
			totalAfter += before
			continue
		}

		bounds := img.Bounds()
		w, h := bounds.Dx(), bounds.Dy()
		if w > maxDim || h > maxDim {
			img = imaging.Fit(img, maxDim, maxDim, imaging.Lanczos)
		}

		var buf bytes.Buffer
		switch ext {
		case ".png":
			err = png.Encode(&buf, img)
		default:
			err = jpeg.Encode(&buf, img, &jpeg.Options{Quality: jpegQuality})
		}
		if err != nil {
			fmt.Fprintf(os.Stderr, "  skip %s: encode failed: %v\n", e.Name(), err)
			skipped++
			totalAfter += before
			continue
		}

		after := int64(buf.Len())
		if after >= before {
			// Re-encoding made it bigger — keep the original.
			totalAfter += before
			unchanged++
			fmt.Printf("  %-55s %6dK  (kept, re-encode larger)\n", e.Name(), before/1024)
			continue
		}

		if err := os.WriteFile(path, buf.Bytes(), 0644); err != nil {
			fmt.Fprintf(os.Stderr, "  skip %s: write failed: %v\n", e.Name(), err)
			skipped++
			totalAfter += before
			continue
		}

		totalAfter += after
		compressed++
		pct := float64(before-after) / float64(before) * 100
		fmt.Printf("  %-55s %6dK → %6dK  (%.0f%% saved)\n", e.Name(), before/1024, after/1024, pct)
	}

	fmt.Println()
	fmt.Printf("Done. %d compressed, %d unchanged, %d skipped.\n", compressed, unchanged, skipped)
	fmt.Printf("Total: %dK → %dK (%.0f%% reduction)\n",
		totalBefore/1024, totalAfter/1024,
		float64(totalBefore-totalAfter)/float64(totalBefore)*100)
}
