import { writeFileSync } from "fs";
import { addDays, addBusinessDays, format, parse } from "date-fns";
import * as carriersAndPakcage from "./data/input.json" assert { type: "json" };
import path from "path";

const { carriers, packages } = carriersAndPakcage.default;

// CONVERT CARRIERS TO A HASHMAP
const carriersMap = new Map();
carriers.forEach((carrier) => {
  const { code, delivery_promise, saturday_deliveries } = carrier;
  carriersMap.set(code, { delivery_promise, saturday_deliveries });
});

// CUSTOMIZED FUNCTION TO ADD DAYS SINCE DATE-FNS ADD BUSINESS DAYS WOULD NOT WORK
const addCustomBusinessDays = (startDate, daysToAdd) => {
  const SUNDAY = 0;
  startDate = new Date(startDate.replace(/-/g, "/"));
  let endDate = "",
    count = 0;
  while (count < daysToAdd) {
    endDate = new Date(startDate.setDate(startDate.getDate() + 1));
    if (endDate.getDay() != SUNDAY) {
      count++;
    }
  }
  return endDate;
};

// GENERATE DELIVERIES USING SHIPPING DATE
const deliveries = { deliveries: [] };
deliveries.deliveries = packages.map((item) => {
  const carrier = carriersMap.get(item.carrier);
  const expected_delivery = format(
    carrier.saturday_deliveries
      ? addCustomBusinessDays(item.shipping_date, carrier.delivery_promise + 1)
      : addBusinessDays(
          parse(item.shipping_date, "yyyy-MM-dd", new Date()),
          carrier.delivery_promise + 1
        ),
    "yyyy-MM-dd"
  );
  return {
    package_id: item.id,
    expected_delivery,
  };
});

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
