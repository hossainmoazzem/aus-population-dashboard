import { NextResponse } from 'next/server';

export async function GET() {
  const absUrl = "https://abs.gov.au";

  try {
    const response = await fetch(absUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 86400 } // Cache data on Vercel for 24 hours
    });

    if (!response.ok) throw new Error('Failed to fetch from ABS');
    
    const rawData = await response.json();
    
    // 1. Safely locate the observations dictionary in the new flattened format
    const observations = rawData.data?.dataSets?.[0]?.observations || {};
    
    // 2. Safely find the corresponding time period labels
    const timeDimensions = rawData.data?.structure?.dimensions?.observation || [];
    const timePeriodDim = timeDimensions.find(d => d.id === 'TIME_PERIOD');
    const timeLabels = timePeriodDim ? timePeriodDim.values.map(v => v.name) : ["Q1 2026"];

    // 3. Process the dictionary entries into a clean array for the graph
    const cleanData = Object.keys(observations).map((key) => {
      const dataValues = observations[key];
      // The absolute population number is the first item inside the value array
      const rawPopulation = dataValues ? dataValues[0] : 0; 
      
      // Split the positional key to find the time index (e.g. "0:0:0:0:0:0")
      const keyParts = key.split(':');
      const timeIndex = parseInt(keyParts[0], 10) || 0;

      return {
        quarter: timeLabels[timeIndex] || "Q1 2026",
        populationInMillions: parseFloat((rawPopulation / 1000000).toFixed(2)), 
        rawPopulation: rawPopulation
      };
    });

    // Ensure we filter out any empty entries and send clean JSON to the frontend
    return NextResponse.json(cleanData.filter(d => d.rawPopulation > 0));

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
