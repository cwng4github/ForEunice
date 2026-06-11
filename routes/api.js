const express = require('express');
const router = express.Router();
const { babyProfile, referencePattern, records, forecasts } = require('../db/database');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Get all data
router.get('/data', async (req, res) => {
  try {
    const profile = await babyProfile.get();
    const reference = await referencePattern.getAll();
    const allRecords = await records.getAll();
    const allForecasts = await forecasts.getAll();
    
    res.json({
      birthDate: profile ? profile.birth_date : null,
      reference: reference.map(r => ({
        time: r.time,
        feed: r.feed,
        sleepStart: r.sleep_start,
        sleepEnd: r.sleep_end,
        poop: r.poop
      })),
      records: allRecords.map(r => ({
        id: r.id,
        date: r.date,
        time: r.time,
        feedLeft: r.feed_left,
        feedRight: r.feed_right,
        feedBreastMilk: r.feed_breast_milk,
        feedFormula: r.feed_formula,
        sleepStart: r.sleep_start === 1,
        sleepEnd: r.sleep_end === 1,
        poop: r.poop,
        pee: r.pee,
        bath: r.bath === 1,
        notes: r.notes
      })),
      forecasts: allForecasts
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Save baby profile
router.post('/baby-profile', async (req, res) => {
  try {
    const { birthDate } = req.body;
    if (!birthDate) {
      return res.status(400).json({ error: 'Birth date is required' });
    }
    
    await babyProfile.save(birthDate);
    res.json({ success: true, message: 'Baby profile saved' });
  } catch (error) {
    console.error('Error saving baby profile:', error);
    res.status(500).json({ error: 'Failed to save baby profile' });
  }
});

// Get baby profile
router.get('/baby-profile', async (req, res) => {
  try {
    const profile = await babyProfile.get();
    res.json(profile ? { birthDate: profile.birth_date } : { birthDate: null });
  } catch (error) {
    console.error('Error fetching baby profile:', error);
    res.status(500).json({ error: 'Failed to fetch baby profile' });
  }
});

// Save reference pattern
router.post('/reference-pattern', async (req, res) => {
  try {
    const { patterns } = req.body;
    if (!Array.isArray(patterns)) {
      return res.status(400).json({ error: 'Patterns must be an array' });
    }
    
    await referencePattern.saveAll(patterns);
    res.json({ success: true, message: 'Reference pattern saved' });
  } catch (error) {
    console.error('Error saving reference pattern:', error);
    res.status(500).json({ error: 'Failed to save reference pattern' });
  }
});

// Get reference pattern
router.get('/reference-pattern', async (req, res) => {
  try {
    const patterns = await referencePattern.getAll();
    res.json(patterns.map(r => ({
      time: r.time,
      feed: r.feed,
      sleepStart: r.sleep_start,
      sleepEnd: r.sleep_end,
      poop: r.poop
    })));
  } catch (error) {
    console.error('Error fetching reference pattern:', error);
    res.status(500).json({ error: 'Failed to fetch reference pattern' });
  }
});

// Get all records
router.get('/records', async (req, res) => {
  try {
    const { date } = req.query;
    let allRecords;
    
    if (date) {
      allRecords = await records.getByDate(date);
    } else {
      allRecords = await records.getAll();
    }
    
    res.json(allRecords.map(r => ({
      id: r.id,
      date: r.date,
      time: r.time,
      feedLeft: r.feed_left,
      feedRight: r.feed_right,
      feedBreastMilk: r.feed_breast_milk,
      feedFormula: r.feed_formula,
      sleepStart: r.sleep_start === 1,
      sleepEnd: r.sleep_end === 1,
      poop: r.poop,
      pee: r.pee,
      bath: r.bath === 1,
      notes: r.notes
    })));
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// Add a record
router.post('/records', async (req, res) => {
  try {
    const record = req.body;
    if (!record.id || !record.date) {
      return res.status(400).json({ error: 'Record ID and date are required' });
    }
    
    await records.add(record);
    res.json({ success: true, message: 'Record added' });
  } catch (error) {
    console.error('Error adding record:', error);
    res.status(500).json({ error: 'Failed to add record' });
  }
});

// Update a record
router.put('/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = req.body;
    
    await records.update(id, record);
    res.json({ success: true, message: 'Record updated' });
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// Delete a record
router.delete('/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await records.delete(id);
    res.json({ success: true, message: 'Record deleted' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

// Get all forecasts
router.get('/forecasts', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (date) {
      const forecast = await forecasts.getByDate(date);
      res.json(forecast);
    } else {
      const allForecasts = await forecasts.getAll();
      res.json(allForecasts);
    }
  } catch (error) {
    console.error('Error fetching forecasts:', error);
    res.status(500).json({ error: 'Failed to fetch forecasts' });
  }
});

// Save a forecast
router.post('/forecasts', async (req, res) => {
  try {
    const { date, rows } = req.body;
    if (!date || !Array.isArray(rows)) {
      return res.status(400).json({ error: 'Date and rows are required' });
    }
    
    await forecasts.save(date, rows);
    res.json({ success: true, message: 'Forecast saved' });
  } catch (error) {
    console.error('Error saving forecast:', error);
    res.status(500).json({ error: 'Failed to save forecast' });
  }
});

// Export CSV data
router.get('/export/csv', async (req, res) => {
  try {
    const profile = await babyProfile.get();
    const reference = await referencePattern.getAll();
    const allRecords = await records.getAll();
    const allForecasts = await forecasts.getAll();

    let csv = '';
    
    csv += '=== BABY PROFILE ===\n';
    csv += `birth_date,${profile ? profile.birth_date : ''}\n\n`;
    
    csv += '=== REFERENCE PATTERN ===\n';
    csv += 'index,time,feed,sleep_start,sleep_end,poop\n';
    reference.forEach((r, i) => {
      csv += `${i + 1},${r.time || ''},${r.feed || ''},${r.sleep_start || ''},${r.sleep_end || ''},${r.poop || ''}\n`;
    });
    csv += '\n';
    
    csv += '=== HISTORY RECORDS ===\n';
    csv += 'id,date,time,feed_left_mins,feed_right_mins,feed_breast_milk_ml,feed_formula_ml,sleep_start,sleep_end,poop,pee,bath,notes\n';
    allRecords.forEach(r => {
      csv += `${r.id},${r.date},${r.time || ''},${r.feed_left || 0},${r.feed_right || 0},${r.feed_breast_milk || 0},${r.feed_formula || 0},${r.sleep_start ? 'Y' : 'N'},${r.sleep_end ? 'Y' : 'N'},${r.poop || ''},${r.pee || ''},${r.bath ? 'Y' : 'N'},"${r.notes || ''}"\n`;
    });
    csv += '\n';
    
    csv += '=== FORECASTS ===\n';
    csv += 'date,row_index,time,feed,sleep_start,sleep_end,poop\n';
    allForecasts.forEach(f => {
      f.rows.forEach((row, idx) => {
        csv += `${f.date},${idx + 1},${row.time || ''},${row.feed || ''},${row.sleepStart || ''},${row.sleepEnd || ''},${row.poop || ''}\n`;
      });
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=baby_log.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

module.exports = router;

// Made with Bob
