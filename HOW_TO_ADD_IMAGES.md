# How to Add Images to About Page

## 📁 Folder Structure

Create the following folders in your `public` directory:

```
public/
  images/
    gallery/
      oil-1.jpg
      oil-2.jpg
      idly-1.jpg
      idly-2.jpg
      masala-1.jpg
      masala-2.jpg
      ready-to-eat-1.jpg
      ready-to-eat-2.jpg
    certificates/
      fssai.jpg
      iso22000.jpg
      organic.jpg
      haccp.jpg
```

## 🖼️ Gallery Images

Add your product images to `public/images/gallery/`:

- **Oil Products**: `oil-1.jpg`, `oil-2.jpg`, etc.
- **Idly Products**: `idly-1.jpg`, `idly-2.jpg`, etc.
- **Masala Powders**: `masala-1.jpg`, `masala-2.jpg`, etc.
- **Ready-to-Eat**: `ready-to-eat-1.jpg`, `ready-to-eat-2.jpg`, etc.

### Image Requirements:
- **Format**: JPG, PNG, or WebP
- **Recommended Size**: 800x800px or larger (square format works best)
- **File Size**: Optimize images to keep file sizes reasonable

## 🏆 Certificate Images/Logos

Add your certificate images or logos to `public/images/certificates/`:

- **FSSAI**: `fssai.jpg` or `fssai.png`
- **ISO 22000**: `iso22000.jpg` or `iso22000.png`
- **Organic**: `organic.jpg` or `organic.png`
- **HACCP**: `haccp.jpg` or `haccp.png`

### Certificate Requirements:
- **Format**: JPG, PNG, or WebP
- **Recommended Size**: 600x400px or larger (landscape format)
- **Quality**: High resolution for clarity

## 📝 Steps to Add Images

1. **Create folders** (if they don't exist):
   ```bash
   mkdir -p public/images/gallery
   mkdir -p public/images/certificates
   ```

2. **Add your images** to the respective folders

3. **Update image paths** in `app/about/page.tsx` if needed:
   - Gallery images are already configured
   - Certificate images are already configured

4. **Restart your dev server** after adding images:
   ```bash
   npm run dev
   ```

## ✨ Features

- **Automatic fallback**: If an image doesn't exist, a placeholder will show
- **Image optimization**: Next.js Image component automatically optimizes images
- **Responsive**: Images adapt to different screen sizes
- **Lazy loading**: Images load as you scroll
- **Modal view**: Click gallery images to view in full screen

## 🎨 Image Tips

- Use high-quality images for best results
- Keep file names consistent with the code
- Optimize images before uploading (use tools like TinyPNG)
- Use square images for gallery (1:1 aspect ratio)
- Use landscape images for certificates (3:2 or 4:3 aspect ratio)
