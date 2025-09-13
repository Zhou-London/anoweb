package util

func PickOrDefault[T comparable](newVal, oldVal T) T {

	var zero T
	if newVal != zero {
		return newVal
	}
	return oldVal
}
