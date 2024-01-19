package miscellaneous

import (
	"golang.org/x/exp/constraints"
	"strings"
)

func Contains[T constraints.Ordered](item T, slice []T) bool {

	for _, value := range slice {
		if value == item {
			return true
		}
	}
	return false

}

func Max[T constraints.Ordered](slice []T) T {
	maxx := slice[0]

	for _, value := range slice[1:] {
		if value > maxx {
			maxx = value
		}
	}

	return maxx

}

func SlicesAreEquals[T constraints.Ordered](slice1, slice2 []T) bool {

	if len(slice1) != len(slice2) {
		return false
	}

	for idx, _ := range slice1 {
		if slice1[idx] != slice2[idx] {
			return false
		}
	}

	return true

}

func LowerSlice(currentSlice []string) {
	for i, v := range currentSlice {
		currentSlice[i] = strings.ToLower(v)
	}
}

func CastBoolToInt(b bool) int8 {
	if b {
		return 1
	} else {
		return 0
	}
}

func Sum[T constraints.Integer](slice []T) T {
	var s T

	for _, v := range slice {
		s += v
	}

	return s
}

func InRange[T constraints.Ordered](value, lowest, highest T, lowestEqual, highestEqual bool) bool {
	var greaterThan bool
	var lessThan bool

	if lowestEqual {
		greaterThan = lowest <= value
	} else {
		greaterThan = lowest < value
	}

	if highestEqual {
		lessThan = highest >= value
	} else {
		lessThan = highest > value
	}

	return greaterThan && lessThan
}
