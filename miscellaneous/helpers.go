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
