package util

import "testing"

func TestValidateSVG(t *testing.T) {
	cases := []struct {
		name string
		svg  string
		ok   bool
	}{
		{"plain", `<svg xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="4"/></svg>`, true},
		{"with style", `<svg xmlns="http://www.w3.org/2000/svg"><style>.a{fill:red}</style><rect class="a" width="3" height="3"/></svg>`, true},
		{"use fragment href", `<svg xmlns="http://www.w3.org/2000/svg"><defs><circle id="c" r="2"/></defs><use href="#c"/></svg>`, true},
		{"data image href", `<svg xmlns="http://www.w3.org/2000/svg"><image href="data:image/png;base64,AAAA"/></svg>`, true},
		{"script element", `<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`, false},
		{"event handler", `<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><rect/></svg>`, false},
		{"foreignObject", `<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><body xmlns="http://www.w3.org/1999/xhtml">x</body></foreignObject></svg>`, false},
		{"javascript href", `<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><rect/></a></svg>`, false},
		{"xlink javascript href", `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:href="javascript:alert(1)"><rect/></a></svg>`, false},
		{"data html href", `<svg xmlns="http://www.w3.org/2000/svg"><a href="data:text/html,<script>alert(1)</script>"><rect/></a></svg>`, false},
		{"not svg", `<html><body>hi</body></html>`, false},
		{"not xml", `GIF89a....`, false},
	}
	for _, tc := range cases {
		err := ValidateSVG([]byte(tc.svg))
		if tc.ok && err != nil {
			t.Errorf("%s: expected valid, got %v", tc.name, err)
		}
		if !tc.ok && err == nil {
			t.Errorf("%s: expected rejection, got nil", tc.name)
		}
	}
}
