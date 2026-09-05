function calculateJourneyCost({ trainCost = 0, hotelCost = 0, foodCost = 0, transportCost = 0 }) {
  const total = Number(trainCost) + Number(hotelCost) + Number(foodCost) + Number(transportCost);
  return {
    train: Math.round(trainCost),
    hotel: Math.round(hotelCost),
    food: Math.round(foodCost),
    transport: Math.round(transportCost),
    total: Math.round(total),
  };
}

function calculateUpdatedCost(originalEstimatedCost, additionalCost) {
  return Math.round(Number(originalEstimatedCost) + Number(additionalCost));
}

module.exports = { calculateJourneyCost, calculateUpdatedCost };
