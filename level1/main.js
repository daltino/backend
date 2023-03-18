import { writeFileSync } from "fs";
import { addDays, format, parse } from "date-fns";
import * as carriersAndPakcage from "./data/input.json" assert { type: "json" };
import path from "path";

const { carriers, packages } = carriersAndPakcage.default;

// CONVERT CARRIERS TO A HASHMAP
const carriersMap = new Map();
carriers.forEach((carrier) => {
  carriersMap.set(carrier.code, carrier.delivery_promise);
});

// GENERATE DELIVERIES USING SHIPPING DATE
const deliveries = { deliveries: [] };
deliveries.deliveries = packages.map((item) => {
  const expected_delivery = format(
    addDays(
      parse(item.shipping_date, "yyyy-MM-dd", new Date()),
      carriersMap.get(item.carrier) + 1
    ),
    "yyyy-MM-dd"
  );

  return {
    package_id: item.id,
    expected_delivery,
  };
});

// WRITE DELIVERIES TO JSON OUTPUT
const deliveriesOutputString = JSON.stringify(deliveries);
const outputFilePath = path.join(
  process.cwd(),
  "data/expected_output_generated.json"
);

try {
  writeFileSync(outputFilePath, deliveriesOutputString);
} catch (error) {
  console.error(error);
  // USE A PROPER LOGGER IN A REAL CASE
}
