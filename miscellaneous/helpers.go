package miscellaneous

import "golang.org/x/exp/constraints"

func Contains[T constraints.Ordered](item T, slice []T) bool {

	for _, value := range slice {
		if value == item {
			return true
		}
	}
	return false

}

func Max[T constraints.Ordered](slice []T) T {
	max := slice[0]

	for _, value := range slice[1:] {
		if value > max {
			max = value
		}
	}

	return max

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
