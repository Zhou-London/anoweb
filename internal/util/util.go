package util

import (
	"bytes"
	"fmt"
	"image/jpeg"
	"image/png"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"github.com/disintegration/imaging"
)

const (
	maxImageDim = 1920
	jpegQual    = 85
)

func PickOrDefault[T comparable](newVal, oldVal T) T {

	var zero T
	if newVal != zero {
		return newVal
	}
	return oldVal
}

func IsImage(filename string) bool {
	switch strings.ToLower(filepath.Ext(filename)) {
	case ".png", ".jpg", ".jpeg", ".svg":
		return true
	}
	return false
}

// CompressAndSave decodes an uploaded image, resizes it if either dimension
// exceeds 1920px (preserving aspect ratio), and re-encodes it to destPath.
// If the compressed result is larger than the original, the original bytes
// are written instead.
func CompressAndSave(fh *multipart.FileHeader, destPath string) error {
	src, err := fh.Open()
	if err != nil {
		return fmt.Errorf("open upload: %w", err)
	}
	defer src.Close()

	// Read original bytes so we can compare sizes.
	raw, err := io.ReadAll(src)
	if err != nil {
		return fmt.Errorf("read upload: %w", err)
	}

	// SVG is vector — nothing to recompress; validate it instead (a scripted
	// SVG served from the site origin would run with first-party cookies).
	if strings.ToLower(filepath.Ext(destPath)) == ".svg" {
		if err := ValidateSVG(raw); err != nil {
			return err
		}
		return os.WriteFile(destPath, raw, 0644)
	}

	img, err := imaging.Decode(bytes.NewReader(raw), imaging.AutoOrientation(true))
	if err != nil {
		// Not decodable — save the original bytes as-is.
		return os.WriteFile(destPath, raw, 0644)
	}

	bounds := img.Bounds()
	w, h := bounds.Dx(), bounds.Dy()
	if w > maxImageDim || h > maxImageDim {
		img = imaging.Fit(img, maxImageDim, maxImageDim, imaging.Lanczos)
	}

	var buf bytes.Buffer
	ext := strings.ToLower(filepath.Ext(destPath))
	switch ext {
	case ".png":
		enc := png.Encoder{CompressionLevel: png.BestCompression}
		err = enc.Encode(&buf, img)
	default:
		err = jpeg.Encode(&buf, img, &jpeg.Options{Quality: jpegQual})
	}
	if err != nil {
		return fmt.Errorf("encode image: %w", err)
	}

	// Keep whichever is smaller.
	out := buf.Bytes()
	if buf.Len() >= len(raw) {
		out = raw
	}
	return os.WriteFile(destPath, out, 0644)
}
