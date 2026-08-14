package util

import (
	"bytes"
	"encoding/xml"
	"errors"
	"io"
	"strings"
)

// ErrUnsafeSVG marks an SVG upload rejected by ValidateSVG; handlers should
// map it to a 400 rather than a 500.
var ErrUnsafeSVG = errors.New("SVG contains disallowed content (scripts, event handlers or javascript: links)")

// ValidateSVG rejects files that are not well-formed SVG or that could
// execute script when the image URL is opened directly: <script> and
// <foreignObject> elements, on* event-handler attributes, and
// javascript:/non-image data: URLs in href attributes.
func ValidateSVG(raw []byte) error {
	dec := xml.NewDecoder(bytes.NewReader(raw))
	dec.Strict = false
	sawSVG := false
	for {
		tok, err := dec.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			return ErrUnsafeSVG
		}
		se, ok := tok.(xml.StartElement)
		if !ok {
			continue
		}
		name := strings.ToLower(se.Name.Local)
		if name == "svg" {
			sawSVG = true
		}
		if name == "script" || name == "foreignobject" {
			return ErrUnsafeSVG
		}
		for _, attr := range se.Attr {
			attrName := strings.ToLower(attr.Name.Local)
			if strings.HasPrefix(attrName, "on") {
				return ErrUnsafeSVG
			}
			if attrName == "href" {
				val := strings.ToLower(strings.TrimSpace(attr.Value))
				if strings.HasPrefix(val, "javascript:") ||
					(strings.HasPrefix(val, "data:") && !strings.HasPrefix(val, "data:image/")) {
					return ErrUnsafeSVG
				}
			}
		}
	}
	if !sawSVG {
		return ErrUnsafeSVG
	}
	return nil
}
