const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const domains = require('./domains.json');

app.get('/deploy', async (req, res) => {
    try {
        // Load and filter available domains
        const availableDomains = domains.filter(domain => !domain.used);

        if (availableDomains.length === 0) {
            return res.status(500).send('No domains available');
        }

        // Select the first available domain
        const selectedDomain = availableDomains[0];

        // Mark the domain as used
        selectedDomain.used = true;
        fs.writeFileSync('./domains.json', JSON.stringify(domains, null, 2));

        // GitHub repo to clone and deploy
        const githubRepoUrl = 'https://github.com/Papi99972/v4.git';
        const vercelToken = process.env.VERCEL_TOKEN;

        // Deploy the GitHub repo to Vercel under the selected domain
        const deployResponse = await axios.post('https://api.vercel.com/v13/deployments', {
            name: selectedDomain.name,
            gitSource: { type: 'github', repoUrl: githubRepoUrl },
            target: 'production',
        }, {
            headers: { Authorization: `Bearer ${vercelToken}` }
        });

        res.send(`Deployment started for domain: ${selectedDomain.name}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Deployment failed');
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
