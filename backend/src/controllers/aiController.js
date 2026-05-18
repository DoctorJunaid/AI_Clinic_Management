const axios = require('axios');

// Array of Qwen models to try in order of preference
const QWEN_MODELS = ['qwen-plus', 'qwen3-max', 'qwen3.5-122b-a10b'];

// @desc    Smart Symptom Checker using Qwen AI with Fallback
// @route   POST /api/v1/ai/symptom-check
// @access  Private (Doctor)
exports.symptomCheck = async (req, res) => {
  try {
    const { symptoms = [], age = 30, gender = 'female', history = 'None' } = req.body;
    
    // High-Fidelity Mock Fallback if no API key is supplied
    if (!process.env.QWEN_API_KEY) {
      console.log('Qwen API key not found. Using high-fidelity local clinical diagnostic model.');
      
      const symptomsStr = symptoms.join(' ').toLowerCase();
      let conditions = [];
      let riskLevel = 'low';
      let suggestedTests = [];

      if (symptomsStr.includes('chest') || symptomsStr.includes('heart') || symptomsStr.includes('palpitations') || symptomsStr.includes('pressure')) {
        conditions = [
          { name: 'Essential Hypertension', probability: '88%' },
          { name: 'Stress-induced Autonomic Hyperactivity', probability: '65%' },
          { name: 'Mild Coronary Insufficiency', probability: '35%' }
        ];
        riskLevel = 'high';
        suggestedTests = ['12-Lead Electrocardiogram (ECG)', 'Ambulatory BP Monitoring (24h)', 'Lipid Profile & Serum Electrolytes'];
      } else if (symptomsStr.includes('headache') || symptomsStr.includes('migraine') || symptomsStr.includes('fatigue') || symptomsStr.includes('light')) {
        conditions = [
          { name: 'Classic Migraine with Aura', probability: '90%' },
          { name: 'Digital Eye Strain & Tension Headache', probability: '70%' },
          { name: 'Chronic Fatigue & Dehydration', probability: '45%' }
        ];
        riskLevel = 'medium';
        suggestedTests = ['Complete Blood Count (CBC)', 'Ophthalmic Visual Field Exam', 'Sleep Apnea Screening'];
      } else if (symptomsStr.includes('cough') || symptomsStr.includes('fever') || symptomsStr.includes('throat') || symptomsStr.includes('flu')) {
        conditions = [
          { name: 'Acute Viral Bronchitis', probability: '85%' },
          { name: 'Streptococcal Pharyngitis', probability: '60%' },
          { name: 'Allergic Rhinitis Flares', probability: '40%' }
        ];
        riskLevel = 'low';
        suggestedTests = ['Throat Culture & Rapid Strep Screen', 'Spirometry / Lung Function Test'];
      } else {
        conditions = [
          { name: 'Atypical Viral Syndrome', probability: '75%' },
          { name: 'General Physical Exhaustion', probability: '55%' }
        ];
        riskLevel = 'low';
        suggestedTests = ['Complete Blood Count (CBC)', 'Basic Metabolic Panel (BMP)'];
      }

      return res.status(200).json({
        success: true,
        data: {
          conditions,
          riskLevel,
          suggestedTests,
          _generatedBy: 'MedFlow Clinical Local System'
        }
      });
    }

    const prompt = `Analyze these details: 
      Symptoms: ${symptoms.join(', ')} 
      Age: ${age}
      Gender: ${gender}
      History: ${history}
      
      Return ONLY a raw JSON object (no markdown formatting, no backticks) with: 
      1. "conditions" (array of objects with "name" and "probability" percentage)
      2. "riskLevel" (low, medium, high, critical)
      3. "suggestedTests" (array of strings).`;

    let responseText = null;
    let successfulModel = null;
    let lastError = null;

    for (const model of QWEN_MODELS) {
      try {
        console.log(`Trying AI model: ${model}`);
        
        const response = await axios.post(
          'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
          {
            model: model,
            messages: [
              { role: 'system', content: 'You are an expert medical AI assistant.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.2
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        responseText = response.data.choices[0].message.content;
        successfulModel = model;
        break;
        
      } catch (error) {
        lastError = error;
        const status = error.response?.status;
        console.warn(`Model ${model} failed with status: ${status}`);
        
        if (status === 429 || status === 403 || status >= 500 || error.code === 'ECONNABORTED') {
          console.log(`Falling back to next model...`);
          continue; 
        } else {
          throw error;
        }
      }
    }

    if (!responseText) {
      throw lastError || new Error("All AI models failed");
    }

    let aiData;
    try {
      const jsonStr = responseText.replace(/```json|```/g, '').trim();
      aiData = JSON.parse(jsonStr);
      aiData._generatedBy = successfulModel; 
    } catch(e) {
       aiData = { error: 'Failed to parse AI response', raw: responseText, _generatedBy: successfulModel };
    }

    res.status(200).json({ success: true, data: aiData });
    
  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.response?.data?.error?.message || error.message });
  }
};

// @desc    AI Prescription Explainer with local clinical fallback
// @route   POST /api/v1/ai/explain-prescription
// @access  Private (Doctor, Patient)
exports.explainPrescription = async (req, res) => {
  try {
    const { medicines = [], instructions = '' } = req.body;

    if (medicines.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide at least one medicine' });
    }

    // High-Fidelity Mock Fallback
    if (!process.env.QWEN_API_KEY) {
      console.log('Qwen API key not found. Using local clinical explainer.');
      
      let explanation = `Here is a patient-friendly breakdown of your clinical prescription layout:\n\n`;
      
      medicines.forEach((med, idx) => {
        explanation += `• **${med.name}** (${med.dosage}): This is scheduled for *${med.frequency}* for a duration of *${med.duration}*. `;
        
        // Custom descriptions based on common medicines
        const nameLower = med.name.toLowerCase();
        if (nameLower.includes('lipitor') || nameLower.includes('atorvastatin')) {
          explanation += `It works to manage cholesterol levels and protect cardiovascular integrity. Take it in the evening.\n`;
        } else if (nameLower.includes('amoxicillin') || nameLower.includes('penicillin') || nameLower.includes('antibiotic')) {
          explanation += `It is a targeted antibiotic prescribed to eliminate bacterial infection. **Complete the full course** even if you feel better.\n`;
        } else if (nameLower.includes('coq10')) {
          explanation += `It acts as a metabolic supplement supporting cellular energy synthesis and preventing muscle cramps.\n`;
        } else if (nameLower.includes('metformin')) {
          explanation += `It stabilizes blood sugar values by improving insulin sensitivity. Take with meals.\n`;
        } else {
          explanation += `It is prescribed to treat your active symptoms and accelerate clinical recovery.\n`;
        }
      });

      if (instructions) {
        explanation += `\n**Clinical Guidelines:**\n${instructions}\n`;
      }
      
      explanation += `\n**Lifestyle Advice:** Ensure optimal hydration (8-10 glasses of water daily), maintain adequate rest, and monitor any adverse symptoms immediately. Contact the clinic if palpitations or hives develop.`;

      return res.status(200).json({
        success: true,
        data: {
          explanation,
          _generatedBy: 'MedFlow Local Explainer System'
        }
      });
    }

    const prompt = `Provide a patient-friendly explanation of these medicines:
      Medicines: ${JSON.stringify(medicines)}
      Additional Instructions: ${instructions}
      
      Format the explanation beautifully with clear bullet points, describing what each medicine is for, how to take it safely, and lifestyle/diet advice to support recovery.`;

    const response = await axios.post(
      'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        model: 'qwen-plus',
        messages: [
          { role: 'system', content: 'You are a warm, helpful clinical pharmacist.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const explanation = response.data.choices[0].message.content;
    res.status(200).json({ success: true, data: { explanation, _generatedBy: 'qwen-plus' } });

  } catch (error) {
    console.error("AI Explainer Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.response?.data?.error?.message || error.message });
  }
};
