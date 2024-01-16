export const requirements = [
  //index = floor((currentPower - 40M)/5M)
  {
    // Less than 40M Power
    powerLoss: 1_600_000,
    killRequirement: 3_000_000,
  },
  {
    // 40M Power to 45M Power
    powerLoss: 2_000_000,
    killRequirement: 4_000_000,
  },
  {
    // 45M Power to 50M Power
    powerLoss: 2_200_000,
    killRequirement: 5_000_000,
  },
  {
    // 50M Power to 55M Power
    powerLoss: 2_525_000,
    killRequirement: 7_000_000,
  },
  {
    // 55M Power to 60M Power
    powerLoss: 3_690_500,
    killRequirement: 10_000_000,
  },
  {
    // 60M Power to 65M Power
    powerLoss: 5_766_000,
    killRequirement: 12_000_000,
  },
  {
    // 65M Power to 70M Power
    powerLoss: 7_826_000,
    killRequirement: 14_000_000,
  },
  {
    // 70M Power to 75M Power
    powerLoss: 9_877_000,
    killRequirement: 16_000_000,
  },
  {
    // 75M Power to 80M Power
    powerLoss: 11_917_500,
    killRequirement: 18_000_000,
  },
  {
    // 80M Power to 85M Power
    powerLoss: 13_960_000,
    killRequirement: 20_000_000,
  },
  {
    // 85M Power to 90M Power
    powerLoss: 15_997_000,
    killRequirement: 22_000_000,
  },
  {
    // 90M Power to 95M Power
    powerLoss: 18_027_000,
    killRequirement: 26_000_000,
  },
  {
    // 95M Power to 100M Power
    powerLoss: 21_080_000,
    killRequirement: 30_000_000,
  },
  {
    // 100M Power to 105M Power
    powerLoss: 24_130_000,
    killRequirement: 31_500_000,
  },
  {
    // 105M Power to 110M Power
    powerLoss: 27_174_000,
    killRequirement: 33_000_000,
  },
  {
    // 110M Power to 115M Power
    powerLoss: 30_206_000,
    killRequirement: 34_500_000,
  },
  {
    // 115M Power to 120M Power
    powerLoss: 32_223_000,
    killRequirement: 36_000_000,
  },
  {
    // 120M Power to 125M Power
    powerLoss: 34_236_000,
    killRequirement: 37_500_000,
  },
  {
    // 125M Power to 130M Power
    powerLoss: 36_250_000,
    killRequirement: 39_000_000,
  },
  {
    // 130M Power to 135M Power
    powerLoss: 38_260_000,
    killRequirement: 40_500_000,
  },
  {
    // 135M Power to 140M Power
    powerLoss: 40_270_000,
    killRequirement: 42_000_000,
  },
  {
    // 140M Power to 145M Power
    powerLoss: 42_280_000,
    killRequirement: 43_500_000,
  },
  {
    // 145M Power to 150M Power
    powerLoss: 44_283_000,
    killRequirement: 45_00_000,
  },
  {
    // 150M Power or more
    powerLoss: 50_000_000,
    killRequirement: 50_000_000,
  },
];
