import type { PackingItem } from '@/types/weather';

export function getPackingAdvisory(params: {
  apparentTempMax: number;
  apparentTempMin: number;
  uvIndexMax: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  weatherCode: number;
}): PackingItem[] {
  const { apparentTempMax, apparentTempMin, uvIndexMax, precipitationProbabilityMax, windSpeedMax, weatherCode } = params;
  const items: PackingItem[] = [];
  const avgFeelsLike = (apparentTempMax + apparentTempMin) / 2;

  // Temperature-based clothing
  if (avgFeelsLike <= 0) {
    items.push({
      category: 'Clothing',
      items: ['Heavy winter coat', 'Thermal base layers', 'Insulated gloves', 'Warm hat & scarf', 'Wool socks', 'Insulated boots'],
      reason: `Feels like ${Math.round(avgFeelsLike)}°C, extreme cold`,
    });
  } else if (avgFeelsLike <= 10) {
    items.push({
      category: 'Clothing',
      items: ['Warm coat', 'Sweater or fleece', 'Gloves', 'Hat', 'Warm socks'],
      reason: `Feels like ${Math.round(avgFeelsLike)}°C, cold`,
    });
  } else if (avgFeelsLike <= 18) {
    items.push({
      category: 'Clothing',
      items: ['Light jacket', 'Layered tops', 'Comfortable trousers'],
      reason: `Feels like ${Math.round(avgFeelsLike)}°C, cool`,
    });
  } else if (avgFeelsLike <= 27) {
    items.push({
      category: 'Clothing',
      items: ['Light clothing', 'T-shirts', 'Shorts or light trousers'],
      reason: `Feels like ${Math.round(avgFeelsLike)}°C, comfortable`,
    });
  } else {
    items.push({
      category: 'Clothing',
      items: ['Very light, breathable clothing', 'Sun hat', 'Sandals'],
      reason: `Feels like ${Math.round(avgFeelsLike)}°C, hot`,
    });
  }

  // UV protection
  if (uvIndexMax >= 8) {
    items.push({
      category: 'Sun Protection',
      items: ['SPF 50+ sunscreen (reapply every 2h)', 'Wide-brim sun hat', 'UV-blocking sunglasses', 'Long sleeves for midday'],
      reason: `UV index ${uvIndexMax}, very high/extreme`,
    });
  } else if (uvIndexMax >= 6) {
    items.push({
      category: 'Sun Protection',
      items: ['SPF 30+ sunscreen', 'Sunglasses', 'Hat'],
      reason: `UV index ${uvIndexMax}, high`,
    });
  } else if (uvIndexMax >= 3) {
    items.push({
      category: 'Sun Protection',
      items: ['SPF 15+ sunscreen', 'Sunglasses'],
      reason: `UV index ${uvIndexMax}, moderate`,
    });
  }

  // Rain gear
  if (precipitationProbabilityMax >= 70) {
    items.push({
      category: 'Rain Gear',
      items: ['Waterproof rain jacket', 'Waterproof shoes or wellies', 'Compact umbrella'],
      reason: `${precipitationProbabilityMax}% chance of rain, very likely`,
    });
  } else if (precipitationProbabilityMax >= 40) {
    items.push({
      category: 'Rain Gear',
      items: ['Compact umbrella', 'Water-resistant layer'],
      reason: `${precipitationProbabilityMax}% chance of rain, possible`,
    });
  }

  // Snow gear
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    items.push({
      category: 'Snow Gear',
      items: ['Waterproof snow boots', 'Warm waterproof gloves', 'Snow-appropriate outerwear'],
      reason: 'Snow expected',
    });
  }

  // Wind
  if (windSpeedMax > 60) {
    items.push({
      category: 'Wind Protection',
      items: ['Windproof jacket', 'Secure bag / avoid umbrellas', 'Hat with strap'],
      reason: `Wind up to ${Math.round(windSpeedMax)} km/h, very windy`,
    });
  } else if (windSpeedMax > 30) {
    items.push({
      category: 'Wind Protection',
      items: ['Windbreaker', 'Secure loose items'],
      reason: `Wind up to ${Math.round(windSpeedMax)} km/h, breezy`,
    });
  }

  // Hydration in heat
  if (avgFeelsLike > 28) {
    items.push({
      category: 'Hydration',
      items: ['Reusable water bottle (drink 500ml+ extra)', 'Electrolyte tablets for outdoor activities'],
      reason: 'Heat increases dehydration risk',
    });
  }

  return items;
}
