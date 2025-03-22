package main

import (
	"math"
	"syscall/js"
)

// spirograph calculates the points for a Spirograph design.
// It now accepts an array of pen positions (d).
func spirograph(this js.Value, args []js.Value) interface{} {
	// Parse parameters from JavaScript
	R := args[0].Float()
	r := args[1].Float()
	dArray := make([]float64, args[2].Length())
	for i := 0; i < args[2].Length(); i++ {
		dArray[i] = args[2].Index(i).Float()
	}
	inside := args[3].Bool()

	// Calculate the least common multiple (LCM) of R and r to determine
	// the number of revolutions needed for the pattern to repeat.
	gcd := func(a, b float64) float64 {
		for b != 0 {
			a, b = b, math.Mod(a, b)
		}
		return a
	}
	lcm := (R * r) / gcd(R, r)
	numRevolutions := lcm / R
	endT := 2 * math.Pi * numRevolutions

	// Prepare to store points for all pens
	allPoints := make([]interface{}, len(dArray))

	for penIndex, d := range dArray {
		var x, y func(t float64) float64
		if inside {
			// Hypotrochoid (inside the large circle)
			x = func(t float64) float64 {
				return (R-r)*math.Cos(t) + d*math.Cos(((R-r)/r)*t)
			}
			y = func(t float64) float64 {
				return (R-r)*math.Sin(t) - d*math.Sin(((R-r)/r)*t)
			}
		} else {
			// Epitrochoid (outside the large circle)
			x = func(t float64) float64 {
				return (R+r)*math.Cos(t) - d*math.Cos(((R+r)/r)*t)
			}
			y = func(t float64) float64 {
				return (R+r)*math.Sin(t) - d*math.Sin(((R+r)/r)*t)
			}
		}

		var points []interface{}
		for t := 0.0; t <= endT; t += 0.01 {
			points = append(points, map[string]interface{}{
				"x": x(t),
				"y": y(t),
			})
		}
		allPoints[penIndex] = js.ValueOf(points)
	}

	return js.ValueOf(allPoints)
}

func main() {
	c := make(chan struct{}, 0)
	js.Global().Set("spirograph", js.FuncOf(spirograph))
	<-c
}