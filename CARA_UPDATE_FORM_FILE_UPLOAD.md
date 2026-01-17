# Cara Update Form dari URL Input ke File Upload

Saya sudah mengupdate **Pengusul Registration Form** sebagai contoh. Berikut adalah form-form lain yang perlu diupdate dengan pola yang sama:

## ✅ SUDAH DIUPDATE (SEMUA SELESAI):
1. **Pengusul Registration** (`frontend/src/app/pengusul/register/page.tsx`)
   - KTP Image: dari URL string → FileUpload component
   - Supporting Documents: dari URL array → FileUpload component

2. **Berita Create Form** (`frontend/src/app/admin/berita/create/page.tsx`)
   - `coverImageUrl` → `coverImageFiles` (UploadedFile[])

3. **Articles/Pelaporan Create Form** (`frontend/src/app/admin/articles/create/page.tsx` & `frontend/src/app/admin/pelaporan/create/page.tsx`)
   - `coverImageUrl` → `coverImageFiles` (UploadedFile[])

4. **Program Create Form - Admin** (`frontend/src/app/admin/programs/create/page.tsx`)
   - `imageUrl` → `imageFiles`
   - `proposalUrl` → `proposalFiles`
   - `officialLetterUrl` → `officialLetterFiles`
   - `budgetPlanUrl` → `budgetPlanFiles`
   - `aktaNotaris` → `aktaNotarisFiles`
   - `skKemenkumham` → `skKemenkumhamFiles`
   - `npwp` → `npwpFiles`
   - `suratDomisili` → `suratDomisiliFiles`
   - `legalityDocs` → `legalityDocsFiles`
   - `ktpPengajuUrl` → `ktpPengajuFiles`
   - `buktiKondisiUrls` → `buktiKondisiFiles`
   - `suratKeteranganRtUrl` → `suratKeteranganRtFiles`

5. **Program Create Form - Dashboard** (`frontend/src/app/dashboard/programs/create/page.tsx`)
   - Semua field yang sama dengan admin version

6. **Program Edit Form** (`frontend/src/app/dashboard/programs/[id]/edit/page.tsx`)
   - `imageUrl` → `imageFiles`

## 🎉 SEMUA FORM SUDAH MENGGUNAKAN FILE UPLOAD!

**Tidak ada lagi:**
- ❌ Input field `type="url"` untuk file uploads
- ❌ Placeholder "https://..."
- ❌ Text yang menyuruh user upload ke Google Drive
- ❌ Text "copy URL-nya"
- ❌ Reference ke "layanan cloud lain"

**Sekarang semua form menggunakan:**
- ✅ FileUpload component dengan drag & drop
- ✅ Direct upload ke server backend
- ✅ Preview otomatis untuk gambar
- ✅ Progress indicator
- ✅ File metadata tersimpan di database
- ✅ File management di `/admin/files`

## Pattern yang Digunakan:

### 1. Import dan Interface
```tsx
import FileUpload from '@/components/FileUpload';

interface UploadedFile {
  id: string;
  filename: string;
  storedFilename: string;
  mimeType: string;
  size: number;
}
```

### 2. State Management
```tsx
// Untuk single file
const [coverImageFiles, setCoverImageFiles] = useState<UploadedFile[]>([]);

// Untuk multiple files
const [buktiKondisiFiles, setBuktiKondisiFiles] = useState<UploadedFile[]>([]);
```

### 3. FileUpload Component Usage

**Untuk Gambar (Cover/Banner):**
```tsx
<FileUpload
  label="Gambar Banner Program"
  accept="image/*"
  multiple={false}
  maxSize={10}
  category="COVER_IMAGE"
  entityType="program"
  fieldName="imageUrl"
  description="Upload gambar banner untuk program (max 10MB, opsional)"
  onChange={(files) => setImageFiles(files)}
  value={imageFiles}
/>
```

**Pattern untuk Documents (PDF/Word):**
```tsx
<FileUpload
  label="Proposal Program"
  accept="application/pdf,.doc,.docx"
  multiple={false}
  maxSize={100}
  category="PROPOSAL"
  entityType="program"
  fieldName="proposal"
  required={true}
  description="Upload proposal program (PDF/Word, max 100MB)"
  onChange={(files) => setProposalFiles(files)}
  value={proposalFiles}
/>
```

**Pattern untuk KTP/Dokumen Legalitas:**
```tsx
<FileUpload
  label="Akta Notaris"
  accept="application/pdf,image/*"
  multiple={false}
  maxSize={10}
  category="AKTA_NOTARIS"
  entityType="program"
  fieldName="aktaNotaris"
  description="Upload akta notaris (PDF/Image, max 10MB)"
  onChange={(files) => setAktaNotarisFiles(files)}
  value={aktaNotarisFiles}
/>
```

**Pattern untuk Multiple Files (Bukti Kondisi):**
```tsx
<FileUpload
  label="Bukti Kondisi"
  accept="image/*,video/*"
  multiple={true}
  maxSize={50}
  category="BUKTI_KONDISI"
  entityType="program"
  fieldName="buktiKondisi"
  required={true}
  description="Upload foto/video kondisi yang membutuhkan bantuan (max 50MB per file)"
  onChange={(files) => setBuktiKondisiFiles(files)}
  value={buktiKondisiFiles}
/>
```

## 📝 LANGKAH-LANGKAH UPDATE FORM:

### 1. **Import FileUpload Component**
```tsx
import FileUpload from '@/components/FileUpload';
```

### 2. **Update Interface/Type**
```tsx
// SEBELUM:
interface FormData {
  title: string;
  coverImageUrl: string;  // ❌ URL string
}

// SESUDAH:
interface UploadedFile {
  id: string;
  filename: string;
  storedFilename: string;
  mimeType: string;
  size: number;
}

interface FormData {
  title: string;
  coverImageFiles: UploadedFile[];  // ✅ File objects
}
```

### 3. **Update State**
```tsx
// SEBELUM:
const [formData, setFormData] = useState({
  coverImageUrl: '',
});

// SESUDAH:
const [formData, setFormData] = useState({
  coverImageFiles: [],
});
```

### 4. **Replace Input dengan FileUpload Component**
```tsx
// SEBELUM:
<input
  type="text"
  placeholder="https://..."
  value={formData.coverImageUrl}
  onChange={(e) => setFormData({...formData, coverImageUrl: e.target.value})}
/>

// SESUDAH:
<FileUpload
  label="Cover Image"
  accept="image/*"
  multiple={false}
  maxSize={10}
  category="COVER_IMAGE"
  entityType="berita"
  fieldName="coverImage"
  onChange={(files) => setFormData({...formData, coverImageFiles: files})}
  value={formData.coverImageFiles}
/>
```

### 5. **Update Submit Handler**
```tsx
// SEBELUM:
const response = await beritaApi.create({
  title: formData.title,
  coverImageUrl: formData.coverImageUrl,  // ❌ Direct URL
});

// SESUDAH:
const coverImageUrl = formData.coverImageFiles[0]?.storedFilename
  ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${formData.coverImageFiles[0].storedFilename}`
  : '';

const response = await beritaApi.create({
  title: formData.title,
  coverImageUrl,  // ✅ Constructed from uploaded file
});
```

## 🎯 FILE CATEGORIES

Gunakan category yang sesuai untuk setiap jenis file:

```typescript
enum FileCategory {
  KTP                    // KTP images
  PROPOSAL               // Proposal documents
  AKTA_NOTARIS           // Akta Notaris
  SK_KEMENKUMHAM         // SK Kemenkumham
  NPWP                   // NPWP documents
  SURAT_DOMISILI         // Surat Domisili
  LEGALITY_DOCS          // Other legality docs
  OFFICIAL_LETTER        // Surat Resmi
  BUDGET_PLAN            // RAB (Rencana Anggaran Biaya)
  BUKTI_KONDISI          // Photos/videos of condition
  SURAT_KETERANGAN_RT    // RT/RW letter
  COVER_IMAGE            // Cover images
  OTHER                  // Other files
}
```

## 🚀 HASIL AKHIR

Setelah semua form diupdate:
- ✅ Tidak ada lagi input manual URL
- ✅ Semua file langsung diupload ke server
- ✅ File tersimpan di database dengan metadata lengkap
- ✅ File bisa dikelola di `/admin/files`
- ✅ Preview otomatis untuk gambar
- ✅ Progress indicator saat upload
- ✅ Validation ukuran file (max 100MB)
- ✅ Support drag & drop

## 📍 FILES YANG SUDAH DIUPDATE (LENGKAP)

Semua form berikut sudah menggunakan FileUpload component:

1. ✅ `frontend/src/app/pengusul/register/page.tsx` - Pengusul registration
2. ✅ `frontend/src/app/admin/berita/create/page.tsx` - Berita creation
3. ✅ `frontend/src/app/admin/articles/create/page.tsx` - Articles creation
4. ✅ `frontend/src/app/admin/pelaporan/create/page.tsx` - Pelaporan creation
5. ✅ `frontend/src/app/admin/programs/create/page.tsx` - Admin program creation (LEMBAGA & INDIVIDU)
6. ✅ `frontend/src/app/dashboard/programs/create/page.tsx` - Dashboard program creation
7. ✅ `frontend/src/app/dashboard/programs/[id]/edit/page.tsx` - Program editing

## 🎯 VERIFICATION COMPLETED

Semua pengecekan sudah dilakukan:
- ✅ Tidak ada `type="url"` input fields untuk file uploads
- ✅ Tidak ada placeholder dengan "https://" atau "URL"
- ✅ Tidak ada text yang menyebutkan "Google Drive"
- ✅ Tidak ada text yang menyebutkan "copy URL"
- ✅ Tidak ada text yang menyebutkan "cloud lain"
- ✅ Semua warning text sudah diupdate

## 🏁 PROJECT STATUS: COMPLETE

**Semua form file upload sudah menggunakan FileUpload component!**
Tidak perlu ada update lagi. Semua sudah selesai! 🎉
