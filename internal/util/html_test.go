package util

import "testing"

func TestValidFormat(t *testing.T) {
	for _, v := range []string{FormatMarkdown, FormatHTML} {
		if !ValidFormat(v) {
			t.Errorf("%q should be valid", v)
		}
	}
	for _, v := range []string{"", "md", "HTML", "text"} {
		if ValidFormat(v) {
			t.Errorf("%q should be invalid", v)
		}
	}
}
