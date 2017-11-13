function preset() {
	var value = document.getElementById("l-preset").value;
	
	switch(value) {
		case "l-preset-koch-snowflake":
			setParameters(
				"A++A++A",
				"60",
				"",
				"4",
				[
					"A=A-A++A-A"
				]);
			break;
		case "l-preset-sierpinski-arrowhead-curve":
			setParameters(
				"A",
				"60",
				"",
				"7",
				[
					"A=B-A-B",
					"B=A+B+A"
				]);
			break;
		case "l-preset-plant":
			setParameters(
				"A",
				"33",
				"",
				"8",
				[
					"A=A[+A]BA[-A]",
					"BA=BBA",
					"BB=BBB"
				]);
			break;
		case "l-preset-plant-2":
			setParameters(
				"A",
				"26",
				"",
				"7",
				[
					"A=B[+A][-A]BA",
					"B=BB"
				]);
			break;
		case "l-preset-hilbert-curve":
			setParameters(
				"A",
				"90",
				"AB",
				"5",
				[
					"A=-BC+ACA+CB-",
					"B=+AC-BCB-CA+"
				]);
			break;
		case "l-preset-mosaic":
			setParameters(
				"A-A-A-A",
				"90",
				"",
				"3",
				[
					"A=AA-A+A-A-AA"
				]);
			break;
		case "l-preset-squares-fractal":
			setParameters(
				"A+A+A-A-A",
				"90",
				"",
				"5",
				[
					"A=AXIOM"
				]);
			break;
	}
}