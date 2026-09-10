
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function getGitToken() {
  try {
    const stdout = execSync('git credential fill', {
      input: 'protocol=https\nhost=github.com\n\n',
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const match = stdout.match(/password=(.+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  } catch (err) {
    // ignore
  }
  return process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
}

async function main() {
  const root = process.cwd();
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));
  const version = pkg.version;
  const tag = `v${version}`;
  const owner = 'ArtoMoon';
  const repo = 'lolstock';

  console.log(`🚀 Starting GitHub 
     process for ${tag}...`);

  const token = await getGitToken();
  if (!token) {
    throw new Error('❌ GitHub Token could not be retrieved from git credential manager or GH_TOKEN!');
  }

  const setupFile = path.join(root, 'dist', `MyLoL-Setup-${version}.exe`);
  if (!fs.existsSync(setupFile)) {
    throw new Error(`❌ Setup file not found: ${setupFile}. Please run 'yarn electron:build:setup' first!`);
  }

  const fileSizeMB = (fs.statSync(setupFile).size / (1024 * 1024)).toFixed(2);
  console.log(`📦 Found setup installer: ${path.basename(setupFile)} (${fileSizeMB} MB)`);

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'MyLoL-Release-Uploader',
  };

  const releaseName = `MyLoL v${version} - Desktop Setup & Feature Release`;
  const releaseBody = `## 🎮 MyLoL v${version} Release Notes

The new desktop release for MyLoL, your League of Legends alt-account management dashboard!

### ✨ Key Features & Improvements:
- 🌐 **Multi-Language Support:** Instant 1-click switching between English 🇬🇧 and Turkish 🇹🇷 with persistent language preference.
- 🚀 **First-Launch Onboarding & Dynamic Settings:** Easily configure and test your Riot API Key and MongoDB URI directly from the UI without manual \`.env\` edits.
- 🗑️ **Account Deletion on Details Page:** Delete accounts directly from the detail view with confirmation safety and instant redirection.
- 📁 **Enhanced UI & Tag System:** Modernized archive status indicators with folder icon (\`📁\`) and clean layout.
- ⚡ **Windows NSIS Installer:** Fully automated desktop installer (\`.exe\`) with Desktop Shortcut and Start Menu integration.

---
### 📥 Download & Install:
Download **\`MyLoL-Setup-${version}.exe\`** from the **Assets** section below to install and run the application on Windows.`;

  // 1. Check if release exists
  let release;
  const getRelRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`, {
    headers,
  });

  if (getRelRes.ok) {
    release = await getRelRes.json();
    console.log(`ℹ️ Release ${tag} already exists (ID: ${release.id}). Updating title and description to English...`);
    const patchRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/${release.id}`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: releaseName,
        body: releaseBody,
      }),
    });
    if (patchRes.ok) {
      release = await patchRes.json();
      console.log(`✅ Release ${tag} successfully updated in English!`);
    } else {
      console.warn(`⚠️ Could not update release text: ${await patchRes.text()}`);
    }
  } else if (getRelRes.status === 404) {
    console.log(`✨ Creating new release ${tag}...`);
    const createRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tag_name: tag,
        target_commitish: 'main',
        name: releaseName,
        body: releaseBody,
        draft: false,
        prerelease: false,
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Failed to create release: ${createRes.status} ${errText}`);
    }
    release = await createRes.json();
    console.log(`✅ Release created successfully! ID: ${release.id}`);
  } else {
    const errText = await getRelRes.text();
    throw new Error(`Failed to query release: ${getRelRes.status} ${errText}`);
  }

  // 2. Check if asset already exists in release
  const existingAsset = release.assets?.find((a) => a.name === `MyLoL-Setup-${version}.exe`);
  if (existingAsset && !process.argv.includes('--force')) {
    console.log(`📦 Asset ${existingAsset.name} already exists in release: ${existingAsset.browser_download_url}`);
  } else {
    if (existingAsset) {
      console.log(`🗑️ Deleting existing asset ${existingAsset.name} (ID: ${existingAsset.id})...`);
      await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/assets/${existingAsset.id}`, {
        method: 'DELETE',
        headers,
      });
      console.log(`✅ Old asset removed.`);
    }

    // 3. Upload Setup Asset
    const uploadUrl = release.upload_url.replace(/\{(\?name,label)?\}/, '') + `?name=MyLoL-Setup-${version}.exe`;
    console.log(`⬆️ Uploading ${path.basename(setupFile)} to GitHub Release...`);

    const fileBuffer = fs.readFileSync(setupFile);
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileBuffer.length.toString(),
        'User-Agent': 'MyLoL-Release-Uploader',
      },
      body: fileBuffer,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Upload failed: ${uploadRes.status} ${errText}`);
    }

    const assetData = await uploadRes.json();
    console.log(`🎉 Setup successfully uploaded: ${assetData.browser_download_url}`);
  }

  console.log(`🔗 Release Page: ${release.html_url}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
