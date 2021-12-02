var groups = [

    {
        label: "Blood Pressure",
        measurements:[
            {
                min: 95,
                max: 140,
                yellow_min: 80,
                yellow_max: 130,
                red_min: 70,
                red_max: 140,
                units: "mmHg",
                label: "Systolic",
                samples: [
                    {
                        timestamp: 8,
                        value: 130
                    },
					{
                        timestamp: 730,
                        value: 101
                    }
                ]
            },
            {
                min: 60,
                max: 80,
                yellow_min: 50,
                yellow_max: 85,
                red_min: 40,
                red_max: 90,
                units: "mmHg",
                label: "Diastolic",
                samples: [
                    {
                        timestamp: 8,
                        value: 91
                    },
                    {
                        timestamp: 1930,
                        value: 86
                    }
                ]
            },
			{
                min: 60,
                max: 80,
                yellow_min: 50,
                yellow_max: 85,
                red_min: 40,
                red_max: 90,
                units: "mmHg",
                label: "Mean Blood Pressure",
                samples: [
                    {
                        timestamp: 8,
                        value: 83.6
                    },
                    {
                        timestamp: 1930,
                        value: 86
                    }
                ]
            }
        ]
    },
    {
        label: "More Vitals",
        measurements:[
            {
                min: 36.5,
                max: 42,
                yellow_min: 37,
                yellow_max: 38.9,
                red_min: 39,
                red_max: 42,
                units: "",
                label: "Temperature",
                samples: [
                    {
                        timestamp: 8,
                        value: 37.5
                    },
                    {
                        timestamp: 1930,
                        value: 37.5
                    }
                ]
            },
            {
                min: 50,
                max: 100,
                yellow_max: 75,
                red_max: 100,
                units: "bpm",
                label: "Heart Rate",
                samples: [
                    {
                        timestamp: 8,
                        value: 75.3
                    },
                    {
                        timestamp: 1930,
                        value: 73.8
                    }
                ]
            },
			{
                min: 12,
                max: 25,
                yellow_max: 18,
                red_max: 20,
                units: "bpm",
                label: "Respiratory Rate",
                samples: [
                    {
                        timestamp: 8,
                        value: 18
                    },
                    {
                        timestamp: 1930,
                        value: 16
                    }
                ]
            },
			{
                min: 60,
                max: 100,
                yellow_min: 90,
                yellow_max: 93.9,
                red_min: 60,
                red_max: 90,
                units: "%",
                label: "Oxigen Saturation",
                samples: [
                    {
                        timestamp: 8,
                        value: 100
                    },
                    {
                        timestamp: 1930,
                        value: 95
                    }
                ]
            },
			{
                min: 60,
                max: 100,
                yellow_max: 18,
                red_max: 20,
                units: "",
                label: "Urine Output",
                samples: [
                    {
                        timestamp: 8,
                        value: 61
                    },
                    {
                        timestamp: 1930,
                        value: 111
                    }
                ]
            }
        ]
    },

    {
        label: "Lab Tests",
        measurements:[
            {
                min: 0,
                max: 1,
                yellow_min: 1,
                units: "mmol/L",
                label: "HDL (good cholesterol)",
                samples: [
                    {
                        timestamp: 8,
                        value: 1.35
                    },
                    {
                        timestamp: 1930,
                        value: 1.25
                    }
                ]
            },
            {
                min: 0,
                max: 3,
                units: "mmol/L",
                label: "LDL (bad cholesterol)",
                yellow_max: 3,
                red_max: 3.33,
                samples: [
                    {
                        timestamp: 8,
                        value: 3.25
                    },
                    {
                        timestamp: 1930,
                        value: 3.05
                    }
                ]
            },
            {
                min: 0,
                max: 2,
                yellow_max: 2,
                red_max: 2.2,
                units: "mmol/L",
                label: "Triglycerides",
                samples: [
                    {
                        timestamp: 8,
                        value: 2.3
                    },
                    {
                        timestamp: 1930,
                        value: 1.45
                    }
                ]
            }
        ]
    },
];
