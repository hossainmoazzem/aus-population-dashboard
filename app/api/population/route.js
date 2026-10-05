import { NextResponse } from 'next/server';

export async function GET() {
  const absUrl = "https://data.api.abs.gov.au/rest/data/ABS,ERP_Q,1.0.0/1+2+3.3.TOT..Q?startPeriod=2026-Q1&dimensionAtObservation=AllDimensions";

  try {
    const response = await fetch(absUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 86400 } // Caches data on Vercel for 24 hours
    });

    if (!response.ok) throw new Error('Failed to fetch from ABS');
    
    const rawData = await response.json();
    const timePeriods = rawData.data.structure.dimensions.observation.values.map(v => v.name);
    const totalAusObservations = rawData.data.dataSets.series["0:0:0:3:0"].observations;
    
    const cleanData = Object.keys(totalAusObservations).map((key) => {
      const index = parseInt(key, 10);
      const rawPopulation = totalAusObservations[key];
      
      return {
        quarter: timePeriods[index],
        populationInMillions: parseFloat((rawPopulation / 1000000).toFixed(2)), 
        rawPopulation: rawPopulation
      };
    });

    return NextResponse.json(cleanData.reverse());

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
