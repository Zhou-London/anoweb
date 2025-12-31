package util

func PickOrDefault[T comparable](newVal, oldVal T) T {

	var zero T
	if newVal != zero {
		return newVal
	}
	return oldVal
}

func IsImage(filename string) bool {
	if len(filename) < 4 {
		return false
	}
	ext := filename[len(filename)-4:]
	return ext == ".png" || ext == ".jpg" || ext == "jpeg"
}
