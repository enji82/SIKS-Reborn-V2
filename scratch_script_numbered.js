1: <script>
2:     // ======================================================================
3:     // ISOLASI VARIABEL GLOBAL (MASTER BLUEPRINT V8 - FULL COMPLIANCE)
4:     // ======================================================================
5:     var TUGAS_DATA_MASTER = {};
6:     var TUGAS_CACHE_DATA = [];
7:     var TUGAS_TABEL_INSTANCE = null;
8: 
9:     var TUGAS_USER_AKTIF = "";
10:     var TUGAS_IS_ADMIN = false;
11:     var TUGAS_USER_NPSN = "";
12:     var TUGAS_UNIT_TERKUNCI = "";
13: 
14:     var TUGAS_CURRENT_FILE_URL = "";
15:     var TUGAS_PREV_DATA_JSON = null; // Anti-flash Diff Check
16: 
17:     // =================================================================
18:     // 1. INITIALIZATION & SPA VACCINE (BAB I)
19:     // =================================================================
20:     $(document).ready(function () {
21:         TUGAS_TABEL_INSTANCE = null;
22:         $('#tugas_tableState').hide();
23:         tugas_renderSkeleton();
24:         $('#tugas_loadingState').show();
25: 
26:         try {
27:             var user = typeof getSesiUser === 'function' ? getSesiUser() : {};
28:             TUGAS_USER_AKTIF = user.nama_lengkap || user.fullname || user.nama || user.username || "User Web";
29:             TUGAS_IS_ADMIN = (user.role || "").toLowerCase().includes("admin");
30:             TUGAS_USER_NPSN = user.npsn || user.username || "";
31:         } catch (e) { TUGAS_USER_NPSN = ""; TUGAS_IS_ADMIN = false; }
32: 
33:         tugas_initFilterTahun();
34: 
35:         // VAKSINASI EVENT DELEGATION (ANTI MEMORY LEAK)
36:         $(document).off('change', '#tugas_filterUnit, #tugas_filterTahun, #tugas_filterSemester, #tugas_filterStatus').on('change', '#tugas_filterUnit, #tugas_filterTahun, #tugas_filterSemester, #tugas_filterStatus', tugas_terapkanFilterLokal);
37: 
38:         // VAKSIN TOMBOL CARI: Kini memanggil tugas_tarikDataServer secara mutlak (Bypass Cache)
39:         $(document).off('click', '#tugas_btnCari').on('click', '#tugas_btnCari', tugas_tarikDataServer);
40: 
41:         $(document).off('click', '#tugas_btnTambah').on('click', '#tugas_btnTambah', tugas_bukaModalTambah);
42:         $(document).off('change', '#tugas_inputNamaSd, #tugas_inputTahun, #tugas_inputSemester, #tugas_inputKriteria').on('change', '#tugas_inputNamaSd, #tugas_inputTahun, #tugas_inputSemester, #tugas_inputKriteria', tugas_cekKetersediaanSlot);
43:         $(document).off('submit', '#tugas_formUtama').on('submit', '#tugas_formUtama', tugas_handleSimpan);
44:         $(document).off('submit', '#tugas_formVerif').on('submit', '#tugas_formVerif', tugas_handleSimpanVerifikasi);
45:         $(document).off('submit', '#tugas_formHapus').on('submit', '#tugas_formHapus', tugas_handleSimpanHapus);
46:         $(document).off('change', '#tugas_verifStatus').on('change', '#tugas_verifStatus', function () { tugas_cekStatusVerif($(this).val()); });
47: 
48:         $(document).off('click', '.tugas-btn-catatan').on('click', '.tugas-btn-catatan', function () {
49:             var msg = $(this).data('pesan');
50:             statussk_lihatCatatanSultan(msg);
51:         });
52: 
53:         function statussk_lihatCatatanSultan(pesan) {
54:             Sultan.alert('info', 'Catatan Admin', pesan);
55:         }
56: 
57:         $(document).off('click', '#tugas_btnLihatDokumenLama').on('click', '#tugas_btnLihatDokumenLama', function (e) {
58:             e.preventDefault();
59:             tugas_bukaPreview(TUGAS_CURRENT_FILE_URL);
60:         });
61: 
62:         $(document).off('change', '#tugas_inputFile').on('change', '#tugas_inputFile', function (e) {
63:             var fileName = e.target.files[0] ? e.target.files[0].name : 'Pilih file PDF...';
64:             $(this).next('.custom-file-label').html('<i class="fas fa-check text-success mr-1"></i> ' + fileName).addClass('font-weight-bold text-success');
65:         });
66: 
67:         // Reset Modal (SPA Clean Up)
68:         $('#tugas_modalPreview').on('hidden.bs.modal', function () { $('#tugas_framePreviewFull').addClass('d-none').attr('src', ''); $('#tugas_loadingPreviewPDF').removeClass('d-none'); });
69:         $('#tugas_modalVerif').on('hidden.bs.modal', function () { $('#tugas_verifFrame').addClass('d-none').attr('src', ''); $('#tugas_verifNoFile').removeClass('d-none'); });
70: 
71:         tugas_validasiAksesUser();
72:     });
73: 
74:     function tugas_initFilterTahun() {
75:         var now = new Date(); var curYear = now.getFullYear(); var curMonth = now.getMonth();
76:         var htmlTahun = '<option value="">- Semua -</option>';
77:         var formTahun = '<option value="">- Pilih Tahun Ajaran -</option>';
78: 
79:         for (var y = 2021; y <= curYear + 1; y++) {
80:             var thnAjaran = y + "/" + (y + 1);
81:             htmlTahun += '<option value="' + thnAjaran + '">' + thnAjaran + '</option>';
82:             formTahun += '<option value="' + thnAjaran + '">' + thnAjaran + '</option>';
83:         }
84: 
85:         $('#tugas_filterTahun').html(htmlTahun).val("");
86:         $('#tugas_filterSemester').val("");
87:         $('#tugas_filterStatus').val("");
88:         $('#tugas_inputTahun').html(formTahun);
89:     }
90: 
91:     // =================================================================
92:     // 2. GATEKEEPER & AUTO-FILTER LOGIC
93:     // =================================================================
94:     function tugas_validasiAksesUser() {
95:         if (TUGAS_IS_ADMIN) {
96:             $('#tugas_loadingText').html('Mempersiapkan Database Admin...');
97:             $('#tugas_filterUnit').empty().append('<option value="SEMUA">- Semua Sekolah -</option>').prop('disabled', false).removeClass('bg-light text-maroon font-weight-bold');
98: 
99:             // AUTO-SET DEFAULT FILTER UNTUK ADMIN
100:             var now = new Date(); var curYear = now.getFullYear(); var curMonth = now.getMonth();
101:             var currentTa = (curMonth >= 6) ? curYear + '/' + (curYear + 1) : (curYear - 1) + '/' + curYear;
102:             var currentSmt = (curMonth >= 6) ? "Semester 1" : "Semester 2";
103:             $('#tugas_filterTahun').val(currentTa);
104:             $('#tugas_filterSemester').val(currentSmt);
105: 
106:             $('#tugas_btnCari, #tugas_btnTambah').prop('disabled', false);
107:             tugas_tarikDataServer();
108:         } else {
109:             if (!TUGAS_USER_NPSN) {
110:                 $('#tugas_filterUnit').empty().append('<option value="">AKSES DITOLAK (NPSN KOSONG)</option>');
111:                 $('#tugas_loadingText').html('<span class="text-danger"><i class="fas fa-ban mb-2"></i><br>Akses ditolak: Sesi login tidak valid.</span>');
112:                 return;
113:             }
114:             google.script.run.withSuccessHandler(function (resUnit) {
115:                 var dataUnit = JSON.parse(resUnit);
116:                 if (dataUnit.error) {
117:                     $('#tugas_filterUnit').empty().append('<option value="">AKSES DITOLAK</option>');
118:                     $('#tugas_loadingText').html('<span class="text-danger"><i class="fas fa-exclamation-triangle mb-2"></i><br>' + tugas_escapeHtml(dataUnit.error) + '</span>');
119:                     return;
120:                 }
121:                 TUGAS_UNIT_TERKUNCI = dataUnit.unitKerja;
122:                 $('#tugas_filterUnit').empty().append('<option value="' + tugas_escapeHtml(TUGAS_UNIT_TERKUNCI) + '">' + tugas_escapeHtml(TUGAS_UNIT_TERKUNCI) + '</option>').prop('disabled', true);
123:                 $('#tugas_btnCari, #tugas_btnTambah').prop('disabled', false);
124:                 tugas_tarikDataServer();
125:             }).withFailureHandler(function (err) {
126:                 $('#tugas_filterUnit').empty().append('<option value="">ERROR SERVER</option>');
127:                 $('#tugas_loadingText').html('<span class="text-danger"><i class="fas fa-wifi mb-2"></i><br>Koneksi Terputus: ' + tugas_escapeHtml(err.message) + '</span>');
128:             }).getUnitKerjaByNpsnPTK(TUGAS_USER_NPSN);
129:         }
130:     }
131: 
132:     // =================================================================
133:     // 3. FETCH DATA & FILTER (BAB VII - Turbo Seamless)
134:     // =================================================================
135:     function tugas_getLoaderHtml(msg) {
136:         return '<div class="sk-loader-wrapper"><div class="sk-spinner-premium"></div><div class="sk-loading-text">' + (msg || 'Memuat...') + '</div></div>';
137:     }
138: 
139:     function tugas_tarikDataServer() {
140:         var btn = $('#tugas_btnCari');
141:         var cacheKey = 'tugas_cache_full';
142: 
143:         btn.prop('disabled', true).html('<i class="fas fa-bolt fa-spin text-maroon"></i>');
144: 
145:         // TURBO LOGIC: Load from cache first
146:         var cachedData = sessionStorage.getItem(cacheKey);
147:         if (cachedData) {
148:             try {
149:                 TUGAS_CACHE_DATA = JSON.parse(cachedData);
150:                 tugas_renderTabel(TUGAS_CACHE_DATA);
151:                 $('#tugas_loadingState').hide();
152:                 $('#tugas_tableState').show();
153:                 $('#tugas_turboBadge').css('display', 'flex').delay(2000).fadeOut();
154:             } catch (e) { sessionStorage.removeItem(cacheKey); }
155:         }
156: 
157:         if (!$.fn.DataTable.isDataTable('#tugas_tabelUtama') && !cachedData) {
158:             $('#tugas_tableState').hide();
159:             tugas_renderSkeleton();
160:             $('#tugas_loadingState').show();
161:         }
162: 
163:         google.script.run.withSuccessHandler(function (dataRes) {
164:             btn.prop('disabled', false).html('<i class="fas fa-sync-alt text-maroon"></i>');
165: 
166:             if (dataRes && !dataRes.error) {
167:                 var freshDataJSON = JSON.stringify(dataRes);
168:                 if (freshDataJSON === TUGAS_PREV_DATA_JSON) {
169:                     return;
170:                 }
171: 
172:                 TUGAS_CACHE_DATA = dataRes;
173:                 sessionStorage.setItem(cacheKey, freshDataJSON);
174:                 TUGAS_PREV_DATA_JSON = freshDataJSON;
175: 
176:                 // Sultan Auto-Filter logic for Notifications
177:                 if (typeof SK_GLOBAL_FILTER_PRESET !== 'undefined' && SK_GLOBAL_FILTER_PRESET) {
178:                     $('#tugas_filterStatus').val(SK_GLOBAL_FILTER_PRESET);
179:                     SK_GLOBAL_FILTER_PRESET = null; // Clear after use
180:                 }
181: 
182:                 TUGAS_TABEL_INSTANCE = $('#tugas_tabelUtama').DataTable({
183:                     "destroy": true, "ordering": false, "pageLength": 10, "autoWidth": false,
184:                     "deferRender": true, "responsive": false,
185:                     "dom": '<"row"<"col-sm-12"<"table-responsive custom-scrollbar"tr>>>' +
186:                            '<"flex flex-col md:flex-row justify-between items-center gap-4 mt-6"<"text-sm text-body"i><"pagination-wrapper"p>>',
187:                     "columnDefs": [
188:                         { "targets": 0, "className": "py-5 px-4 text-center", "width": "120px" },
189:                         { "targets": [1, 2, 3, 6, 7, 8], "className": "py-5 px-4 text-left" },
190:                         { "targets": [4, 5], "className": "py-5 px-4 text-center" }
191:                     ],
192:                     "language": { "url": "//cdn.datatables.net/plug-ins/1.10.25/i18n/Indonesian.json", "emptyTable": "Tidak ditemukan data SK." },
193:                     "drawCallback": function (settings) {
194:                         $('#tugas_tabelUtama tbody tr').addClass('hover:bg-gray-2 dark:hover:bg-meta-4 transition');
195:                     }
196:                 });
197: 
198:                 tugas_populateFilterOptions();
199:                 tugas_terapkanFilterLokal();
200: 
201:                 $('#tugas_loadingState').hide();
202:                 $('#tugas_tableState').show();
203:                 if (TUGAS_TABEL_INSTANCE) { setTimeout(function () { TUGAS_TABEL_INSTANCE.columns.adjust(); }, 50); }
204:             }
205:         }).withFailureHandler(function (e) {
206:             btn.prop('disabled', false).html('<i class="fas fa-sync-alt text-maroon"></i>');
207:             if (!TUGAS_CACHE_DATA.length) {
208:                 $('#tugas_tableState').hide();
209:                 $('#tugas_loadingState').show();
210:                 $('#tugas_loadingText').html('<span class="text-danger">Koneksi Terputus.</span>');
211:             }
212:         }).getDaftarSK();
213:     }
214: 
215:     function tugas_populateFilterOptions() {
216:         var uniqueUnits = new Set();
217: 
218:         if (typeof DROPDOWN_STATIS !== 'undefined' && DROPDOWN_STATIS["NamaSD"]) {
219:             DROPDOWN_STATIS["NamaSD"].forEach(function (u) { uniqueUnits.add(u); });
220:         } else {
221:             TUGAS_CACHE_DATA.forEach(function (row) { if (row.namaSd) uniqueUnits.add(String(row.namaSd).trim()); });
222:         }
223: 
224:         var sortedUnits = Array.from(uniqueUnits).sort();
225: 
226:         if (TUGAS_IS_ADMIN) {
227:             var uHtml = '<option value="SEMUA">- Semua Sekolah-</option>';
228:             sortedUnits.forEach(function (u) { uHtml += '<option value="' + tugas_escapeHtml(u) + '">' + tugas_escapeHtml(u) + '</option>'; });
229:             var curUnit = $('#tugas_filterUnit').val();
230:             $('#tugas_filterUnit').html(uHtml);
231:             if (curUnit && uniqueUnits.has(curUnit)) $('#tugas_filterUnit').val(curUnit);
232:         }
233: 
234:         var formHtml = '<option value="">- Pilih Sekolah -</option>';
235:         sortedUnits.forEach(function (u) { formHtml += '<option value="' + tugas_escapeHtml(u) + '">' + tugas_escapeHtml(u) + '</option>'; });
236:         $('#tugas_inputNamaSd').html(formHtml);
237:         if (!TUGAS_IS_ADMIN && TUGAS_UNIT_TERKUNCI) {
238:             $('#tugas_inputNamaSd').val(TUGAS_UNIT_TERKUNCI).prop('disabled', true);
239:         }
240:     }
241: 
242:     // =================================================================
243:     // 4. INJEKSI DATA (Sorting Last Activity via Cache & Render)
244:     // =================================================================
245:     function tugas_terapkanFilterLokal() {
246:         if (!TUGAS_TABEL_INSTANCE) return;
247: 
248:         var fTh = String($('#tugas_filterTahun').val() || "");
249:         var fSm = String($('#tugas_filterSemester').val() || "");
250:         var fSt = String($('#tugas_filterStatus').val() || "").toLowerCase();
251: 
252:         var tAdminUnit = TUGAS_IS_ADMIN ? String($('#tugas_filterUnit').val() || "").toUpperCase() : "";
253:         var tUnitUser = String(TUGAS_UNIT_TERKUNCI || "").trim().toUpperCase();
254: 
255:         var hasil = TUGAS_CACHE_DATA.filter(function (row) {
256:             var rTh = String(row.tahun || "").trim();
257:             var rSm = String(row.semester || "").trim();
258:             var rSt = String(row.status || "").trim().toLowerCase();
259:             var rSd = String(row.namaSd || "").trim().toUpperCase();
260: 
261:             var passUnit = false;
262:             if (TUGAS_IS_ADMIN) { passUnit = (tAdminUnit === "SEMUA" || tAdminUnit === "" || rSd === tAdminUnit); }
263:             else { passUnit = (rSd === tUnitUser); }
264: 
265:             var passTh = (fTh === "" || rTh === fTh);
266:             var passSm = (fSm === "" || rSm === fSm);
267: 
268:             var passSt = true;
269:             if (fSt !== "") {
270:                 if (fSt === "ok") passSt = (rSt.includes("ok") || rSt.includes("setuju") || rSt.includes("valid"));
271:                 else if (fSt === "diproses") passSt = (rSt === "" || rSt === "diproses");
272:                 else passSt = rSt.includes(fSt);
273:             }
274: 
275:             return passUnit && passTh && passSm && passSt;
276:         });
277: 
278:         tugas_renderTabel(hasil);
279:     }
280: 
281:     function tugas_renderTabel(data) {
282:         var dtArray = []; TUGAS_DATA_MASTER = {};
283: 
284:         // Pengurutan Tambahan di Frontend (Berdasarkan aktivitas terbaru)
285:         data.sort(function (a, b) {
286:             var timeA = Math.max(tugas_parseDateTime(a.tglUnggah), tugas_parseDateTime(a.tglUpdate), tugas_parseDateTime(a.tglVerval));
287:             var timeB = Math.max(tugas_parseDateTime(b.tglUnggah), tugas_parseDateTime(b.tglUpdate), tugas_parseDateTime(b.tglVerval));
288:             return timeB - timeA;
289:         });
290: 
291:         data.forEach(function (row) {
292:             var id = String(row.rowBaris);
293:             TUGAS_DATA_MASTER[id] = row;
294: 
295:             var safeNoSk = tugas_cleanText(row.noSk || "-");
296:             var safeUrl = String(row.fileUrl || "").replace(/'/g, "%27").replace(/"/g, "%22");
297:             var safeUrlJs = tugas_escapeJs(safeUrl);
298:             var stButton = String(row.status || "").toLowerCase();
299:             var isApproved = (stButton.includes('setuju') || stButton.includes('ok') || stButton.includes('valid'));
300: 
301:             var badgeStatus = tugas_buildBadgeStatus(row.status, row.keterangan);
302: 
303:             // 1. Tombol Aksi (Individual 3 Buttons - SULTAN STYLE)
304:             var actionButtons = '<div class="flex items-center justify-center gap-2">' +
305:                 '<button type="button" class="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm group" onclick="' + (TUGAS_IS_ADMIN ? "tugas_bukaModalVerif('" + id + "')" : "tugas_bukaPreview('" + safeUrlJs + "')") + '" title="' + (TUGAS_IS_ADMIN ? 'Verifikasi' : 'Pratinjau') + '">' +
306:                 '<i class="fas ' + (TUGAS_IS_ADMIN ? 'fa-check-double' : 'fa-eye') + ' text-sm group-hover:scale-110"></i>' +
307:                 '</button>' +
308:                 '<button type="button" class="flex h-9 w-9 items-center justify-center rounded-xl border border-warning/20 bg-warning/5 text-warning hover:bg-warning hover:text-white transition-all shadow-sm group ' + (isApproved ? 'opacity-30 cursor-not-allowed' : '') + '" onclick="' + (isApproved ? 'void(0)' : "tugas_bukaModalEdit('" + id + "')") + '" title="Edit Data">' +
309:                 '<i class="fas fa-pencil-alt text-sm group-hover:scale-110"></i>' +
310:                 '</button>' +
311:                 '<button type="button" class="flex h-9 w-9 items-center justify-center rounded-xl border border-danger/20 bg-danger/5 text-danger hover:bg-danger hover:text-white transition-all shadow-sm group ' + (isApproved ? 'opacity-30 cursor-not-allowed' : '') + '" onclick="' + (isApproved ? 'void(0)' : "tugas_bukaModalHapus('" + id + "')") + '" title="Hapus Data">' +
312:                 '<i class="fas fa-trash-alt text-sm group-hover:scale-110"></i>' +
313:                 '</button>' +
314:                 '</div>';
315: 
316:             // 2. Format Tanggal SK
317:             var tglSkDisplay = row.tglSkDisplay || row.tglSk || "-";
318:             if (tglSkDisplay.match(/^\d{4}-\d{2}-\d{2}$/)) {
319:                 var p = tglSkDisplay.split('-'); tglSkDisplay = p[2] + '-' + p[1] + '-' + p[0];
320:             }
321: 
322:             // 3. Tombol Dokumen
323:             var btnDokumen = safeUrl.length > 5 ? '<button type="button" class="inline-flex rounded-full bg-danger/10 py-1.5 px-4 text-[10px] font-black uppercase tracking-widest text-danger transition hover:bg-danger hover:text-white shadow-sm" onclick="tugas_bukaPreview(\'' + safeUrlJs + '\')"><i class="fas fa-file-pdf mr-2"></i> LIHAT PDF</button>' : '-';
324: 
325:             // 4. Log Detils
326:             var uiDikirim = '<div class="flex flex-col"><span class="text-[11px] font-black text-black dark:text-white">' + (row.tglUnggah || '-') + '</span><span class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">' + (row.userInput || '-') + '</span></div>';
327:             var uiDiubah = row.tglUpdate && row.tglUpdate !== '-' ? '<div class="flex flex-col"><span class="text-[11px] font-black text-black dark:text-white">' + row.tglUpdate + '</span><span class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">' + (row.userUpdate || '-') + '</span></div>' : '-';
328:             var uiVerif = row.tglVerval && row.tglVerval !== '-' ? '<div class="flex flex-col"><span class="text-[11px] font-black text-primary">' + row.tglVerval + '</span><span class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">' + (row.verifikator || '-') + '</span></div>' : '-';
329: 
330:             // KOMBINASI KOLOM
331:             var uiUnit = '<div class="text-[11px] font-black text-black dark:text-white leading-tight uppercase">' + tugas_cleanText(row.namaSd) + '</div><div class="text-[9px] font-bold text-gray-400">' + tugas_cleanText(row.npsn || '-') + '</div>';
332:             var uiTahunSem = '<div class="text-[11px] font-black text-black dark:text-white">' + tugas_cleanText(row.tahun) + '</div><div class="text-[10px] text-primary font-black uppercase tracking-tighter">' + tugas_cleanText(row.semester) + '</div>';
333:             var uiSkDetail = '<div class="text-[11px] font-black text-black dark:text-white leading-tight">' + safeNoSk + '</div>' +
334:                 '<div class="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter flex items-center gap-1"><i class="far fa-calendar-alt opacity-60"></i> ' + tglSkDisplay + ' &bull; <span class="text-primary">' + tugas_cleanText(row.kriteria) + '</span></div>';
335: 
336:             dtArray.push([
337:                 actionButtons,
338:                 uiUnit,
339:                 uiTahunSem,
340:                 uiSkDetail,
341:                 btnDokumen,
342:                 badgeStatus,
343:                 uiDikirim,
344:                 uiDiubah,
345:                 uiVerif
346:             ]);
347:         });
348: 
349:         TUGAS_TABEL_INSTANCE.clear().rows.add(dtArray).draw(false);
350:     }
351: 
352:     // =================================================================
353:     // 5. LOGIKA MODAL FORM & VALIDASI (BAB V)
354:     // =================================================================
355:     function tugas_resetForm() {
356:         $('#tugas_formUtama')[0].reset();
357:         $('#tugas_editRowId').val('');
358:         TUGAS_CURRENT_FILE_URL = "";
359:         $('#tugas_linkFileLama').addClass('hidden');
360:         $('#tugas_labelFile').html('<i class="fas fa-file-pdf text-danger mr-1"></i> Unggah Dokumen Asli <span class="text-danger">*</span>');
361:         $('.custom-file-label').removeClass("selected text-success font-weight-bold").html('Pilih file PDF...');
362:         $('#tugas_areaTerkunci').prop('disabled', true).css('opacity', '0.5');
363:         $('#tugas_inputNamaSd, #tugas_inputTahun, #tugas_inputSemester, #tugas_inputKriteria').prop('disabled', false).removeClass('bg-light');
364:         $('#tugas_btnSimpanForm').removeClass('btn-sultan-indigo').addClass('btn-sultan-maroon').show().prop('disabled', true);
365:         $('#tugas_alertInfo').removeClass('alert-danger alert-success').addClass('alert-info border-info').html('<i class="fas fa-info-circle mr-1"></i> Tentukan <b>Sekolah, Tahun, Semester,</b> dan <b>Kriteria</b> untuk memulai pengisian data SK.');
366:     }
367: 
368:     function tugas_bukaModalTambah() {
369:         tugas_resetForm();
370:         $('#tugas_modalForm .modal-header').removeClass('sultan-header-indigo').addClass('sultan-header-navy');
371:         $('#tugas_judulModalForm').html('<i class="fas fa-plus-circle mr-2"></i> Tambah SK Pembagian Tugas');
372:         $('#tugas_btnSimpanForm').html('<i class="fas fa-save mr-2"></i> SIMPAN DATA SK').removeClass('btn-sultan-indigo').addClass('btn-sultan-maroon');
373: 
374:         var now = new Date(); var curYear = now.getFullYear(); var curMonth = now.getMonth();
375:         var currentTa = (curMonth >= 6) ? curYear + '/' + (curYear + 1) : (curYear - 1) + '/' + curYear;
376:         var currentSmt = (curMonth >= 6) ? "Semester 1" : "Semester 2";
377:         $('#tugas_inputTahun').val(currentTa);
378:         $('#tugas_inputSemester').val(currentSmt);
379:         if (!TUGAS_IS_ADMIN && TUGAS_UNIT_TERKUNCI) { $('#tugas_inputNamaSd').val(TUGAS_UNIT_TERKUNCI); }
380: 
381:         $('#tugas_modalForm').removeClass('hidden').addClass('flex').hide().fadeIn();
382:     }
383: 
384:     function tugas_cekKetersediaanSlot() {
385:         var vSd = $('#tugas_inputNamaSd').val();
386:         var vTh = $('#tugas_inputTahun').val();
387:         var vSm = $('#tugas_inputSemester').val();
388:         var vKr = $('#tugas_inputKriteria').val();
389: 
390:         if (!vSd || !vTh || !vSm || !vKr) {
391:             $('#tugas_areaTerkunci').prop('disabled', true).css('opacity', '0.5');
392:             $('#tugas_btnSimpanForm').hide().prop('disabled', true);
393:             $('#tugas_alertInfo').removeClass('alert-danger alert-success').addClass('alert-info border-info').html('<i class="fas fa-info-circle mr-1"></i> Harap lengkapi semua kolom di atas.');
394:             return;
395:         }
396: 
397:         $('#tugas_alertInfo').removeClass('alert-danger alert-success').addClass('alert-info border-info').html('<i class="fas fa-spinner fa-spin mr-1"></i> Mengecek data di server.');
398: 
399:         var payload = { namaSd: vSd, tahunAjaran: vTh, semester: vSm, kriteria: vKr };
400: 
401:         google.script.run.withSuccessHandler(function (res) {
402:             var currentId = $('#tugas_editRowId').val();
403: 
404:             if (res.found) {
405:                 if (currentId && String(res.data.rowId) === String(currentId)) {
406:                     $('#tugas_areaTerkunci').prop('disabled', false).css('opacity', '1');
407:                     $('#tugas_btnSimpanForm').show().prop('disabled', false).html('<i class="fas fa-save mr-1"></i> UPDATE DATA');
408:                     $('#tugas_alertInfo').removeClass('alert-info alert-danger').addClass('alert-success border-success').html('<i class="fas fa-check-circle mr-1"></i> Mode Edit aktif.');
409:                 } else {
410:                     $('#tugas_areaTerkunci').prop('disabled', true).css('opacity', '0.5');
411:                     $('#tugas_btnSimpanForm').hide().prop('disabled', true);
412:                     $('#tugas_alertInfo').removeClass('alert-info alert-success').addClass('alert-danger border-danger').html('<i class="fas fa-check-circle mr-1"></i> <b>Data ditemukan:</b> Sekolah ini sudah memiliki SK untuk ' + vKr + ' pada ' + vSm + ' TA ' + vTh + '.');
413:                 }
414:             } else {
415:                 $('#tugas_areaTerkunci').prop('disabled', false).css('opacity', '1');
416:                 $('#tugas_btnSimpanForm').show().prop('disabled', false).html('<i class="fas fa-save mr-1"></i> SIMPAN DOKUMEN');
417:                 $('#tugas_alertInfo').removeClass('alert-info alert-danger').addClass('alert-success border-success').html('<i class="fas fa-info-circle mr-1"></i> <b>Data belum diinput:</b> Silakan lanjutkan pengisian Nomor SK dan unggah dokumen.');
418:                 if (!currentId) $('#tugas_inputNoSk').focus();
419:             }
420:         }).cekDuplikatSK(payload);
421:     }
422: 
423:     function tugas_bukaModalEdit(rowId) {
424:         tugas_resetForm();
425:         var rowData = TUGAS_DATA_MASTER[rowId];
426:         if (!rowData) return;
427: 
428:         $('#tugas_modalForm .modal-header').removeClass('sultan-header-navy').addClass('sultan-header-indigo');
429:         $('#tugas_judulModalForm').html('<i class="fas fa-edit mr-2"></i> Edit Data SK Pembagian Tugas');
430:         $('#tugas_editRowId').val(rowId);
431: 
432:         $('#tugas_btnSimpanForm').removeClass('btn-sultan-maroon').addClass('btn-sultan-indigo');
433: 
434:         $('#tugas_inputNamaSd').val(rowData.namaSd);
435:         $('#tugas_inputTahun').val(rowData.tahun);
436:         $('#tugas_inputSemester').val(rowData.semester);
437:         $('#tugas_inputKriteria').val(rowData.kriteria);
438: 
439:         $('#tugas_inputNoSk').val(rowData.noSk);
440:         $('#tugas_inputTglSk').val(rowData.tglSk ? rowData.tglSk.substring(0, 10) : "");
441: 
442:         TUGAS_CURRENT_FILE_URL = rowData.fileUrl || "";
443:         if (TUGAS_CURRENT_FILE_URL) {
444:             $('#tugas_linkFileLama').removeClass('d-none');
445:             $('#tugas_labelFile').html('<i class="fas fa-file-pdf text-danger mr-1"></i> Ganti Dokumen (Opsional)');
446:         }
447: 
448:         $('#tugas_inputNamaSd, #tugas_inputTahun, #tugas_inputSemester, #tugas_inputKriteria').prop('disabled', true).addClass('bg-light');
449:         $('#tugas_areaTerkunci').prop('disabled', false).css('opacity', '1');
450:         $('#tugas_btnSimpanForm').show().prop('disabled', false).html('<i class="fas fa-save mr-2"></i> UPDATE DATA SK');
451:         $('#tugas_alertInfo').removeClass('bg-primary/5 text-primary').addClass('bg-meta-3/5 text-meta-3').html('<p class="text-sm font-medium"><i class="fas fa-check-circle mr-1"></i> Data siap diubah.</p>');
452:         $('#tugas_modalForm').removeClass('hidden').addClass('flex').hide().fadeIn();
453:     }
454: 
455:     function tugas_handleSimpan(e) {
456:         e.preventDefault();
457: 
458:         var btn = $('#tugas_btnSimpanForm');
459:         var btnTxt = btn.html();
460:         var rowId = $('#tugas_editRowId').val();
461: 
462:         // Validasi File jika data baru
463:         if (!rowId && !$('#tugas_inputFile')[0].files[0]) { Sultan.alert('error', 'Dokumen Wajib', 'Harap pilih file PDF SK untuk diunggah.'); return; }
464: 
465:         btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i> MEMPROSES...');
466: 
467:         var fileInput = $('#tugas_inputFile')[0];
468:         if (fileInput.files.length > 0) {
469:             var file = fileInput.files[0];
470:             if (file.size > 1024 * 1024) { Sultan.alert('error', 'File Terlalu Besar', 'Maksimal ukuran file adalah 1 MB.'); btn.prop('disabled', false).html(btnTxt); return; }
471: 
472:             var reader = new FileReader();
473:             reader.onload = function (e) {
474:                 var base64Data = e.target.result.split(',')[1];
475:                 tugas_kirimDataServer(rowId, base64Data, file.name);
476:             };
477:             reader.readAsDataURL(file);
478:         } else {
479:             tugas_kirimDataServer(rowId, null, null);
480:         }
481:     }
482: 
483:     function tugas_kirimDataServer(rowId, base64, fileName) {
484:         var payload = {
485:             editRowId: rowId,
486:             namaSd: $('#tugas_inputNamaSd').val(),
487:             tahunAjaran: $('#tugas_inputTahun').val(),
488:             semester: $('#tugas_inputSemester').val(),
489:             kriteriaSk: $('#tugas_inputKriteria').val(),
490:             nomorSk: $('#tugas_inputNoSk').val(),
491:             tanggalSk: $('#tugas_inputTglSk').val(),
492:             userInput: TUGAS_USER_AKTIF,
493:             userUpdate: TUGAS_USER_AKTIF,
494:             fileData: base64 ? { data: base64.split(',')[1], mimeType: 'application/pdf' } : null
495:         };
496: 
497:         var serverFunction = rowId ? "simpanPerubahanSK" : "processManualForm";
498: 
499:         google.script.run.withSuccessHandler(function (res) {
500:             if (res.success) {
501:                 $('#tugas_modalForm').fadeOut(function() { $(this).addClass('hidden').removeClass('flex'); });
502:                 Sultan.alert('success', 'Berhasil', rowId ? 'Data berhasil diperbarui.' : 'Data berhasil disimpan.');
503:                 tugas_tarikDataServer();
504:                 if (typeof sk_updateSidebarBadge === 'function') sk_updateSidebarBadge();
505:             } else {
506:                 Sultan.alert('error', 'Gagal', res.error || res.message || 'Terjadi kesalahan sistem.');
507:                 $('#tugas_btnSimpanForm').prop('disabled', false).html(rowId ? '<i class="fas fa-save mr-2"></i> UPDATE DATA SK' : '<i class="fas fa-save mr-2"></i> SIMPAN DATA SK');
508:             }
509:         })[serverFunction](payload);
510:     }
511: 
512:     // =================================================================
513:     // 6. LOGIKA VERIFIKASI (ADMIN ONLY)
514:     // =================================================================
515:     function tugas_bukaModalVerif(rowId) {
516:         var d = TUGAS_DATA_MASTER[rowId];
517:         if (!d) return;
518: 
519:         $('#tugas_verifRowId').val(rowId);
520:         $('#tugas_vNamaSd').text(d.namaSd);
521:         $('#tugas_vTahun').text(d.tahun);
522:         $('#tugas_vSemester').text(d.semester);
523:         $('#tugas_vKriteria').text(d.kriteria);
524:         $('#tugas_vNoSk').text(d.noSk);
525: 
526:         var tgl = d.tglSkDisplay || d.tglSk || "-";
527:         $('#tugas_vTglSk').text(tgl);
528: 
529:         $('#tugas_verifStatus').val('');
530:         $('#tugas_verifKeterangan').val(d.keterangan || '');
531:         $('#tugas_verifWajibCatatan').addClass('d-none');
532: 
533:         var url = d.fileUrl || "";
534:         if (url) {
535:             $('#tugas_verifLoader').removeClass('d-none');
536:             // Clear src first to force re-load
537:             $('#tugas_verifFrame').addClass('d-none').attr('src', '');
538:             setTimeout(function () {
539:                 $('#tugas_verifFrame').attr('src', tugas_convertDriveUrl(url));
540:             }, 100);
541:             $('#tugas_verifNoFile').addClass('d-none');
542: 
543:             $('#tugas_verifFrame').off('load').on('load', function () {
544:                 $('#tugas_verifLoader').addClass('d-none');
545:                 $(this).removeClass('d-none');
546:             });
547:             });
548:         } else {
549:             $('#tugas_verifLoader').addClass('hidden');
550:             $('#tugas_verifFrame').addClass('hidden');
551:             $('#tugas_verifNoFile').removeClass('hidden');
552:         }
553: 
554:         $('#tugas_modalVerif').removeClass('hidden').addClass('flex').hide().fadeIn();
555:     }
556: 
557:     function tugas_cekStatusVerif(val) {
558:         if (val === "Revisi" || val === "Ditolak") {
559:             $('#tugas_verifWajibCatatan').removeClass('d-none');
560:         } else {
561:             $('#tugas_verifWajibCatatan').addClass('d-none');
562:         }
563:     }
564: 
565:     function tugas_handleSimpanVerifikasi(e) {
566:         e.preventDefault();
567:         var status = $('#tugas_verifStatus').val();
568:         var catatan = $('#tugas_verifKeterangan').val();
569: 
570:         if ((status === "Revisi" || status === "Ditolak") && !catatan.trim()) {
571:             $('#tugas_verifWajibCatatan').removeClass('d-none');
572:             Sultan.alert('warning', 'Catatan Wajib', 'Harap isi alasan revisi atau penolakan.');
573:             return;
574:         }
575: 
576:         var btn = $('#tugas_btnSimpanVerif');
577:         btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i> EKSEKUSI...');
578: 
579:         var payload = {
580:             verifRowId: $('#tugas_verifRowId').val(),
581:             verifStatus: status,
582:             verifKeterangan: catatan,
583:             verifikator: TUGAS_USER_AKTIF
584:         };
585: 
586:         google.script.run.withSuccessHandler(function (res) {
587:             if (res.success) {
588:                 $('#tugas_modalVerif').fadeOut(function() { $(this).addClass('hidden').removeClass('flex'); });
589:                 Sultan.alert('success', 'Verifikasi Berhasil', 'Status SK telah diperbarui.');
590:                 tugas_tarikDataServer();
591:                 if (typeof sk_updateSidebarBadge === 'function') sk_updateSidebarBadge();
592:             } else {
593:                 Sultan.alert('error', 'Gagal Verifikasi', res.message || 'Terjadi kesalahan.');
594:                 btn.prop('disabled', false).html('<i class="fas fa-check-double mr-2"></i> Eksekusi');
595:             }
596:         }).verifikasiDataSK(payload);
597:     }
598: 
599:     // =================================================================
600:     // 7. LOGIKA HAPUS DATA (ADMIN ONLY)
601:     // =================================================================
602:     function tugas_bukaModalHapus(rowId) {
603:         var d = TUGAS_DATA_MASTER[rowId];
604:         if (!d) return;
605: 
606:         if (!TUGAS_IS_ADMIN) {
607:             var st = String(rowId.status || "").toLowerCase();
608:             if (st.includes('ok') || st.includes('setuju') || st.includes('valid')) {
609:                 Sultan.alert('error', 'Terkunci', 'Anda tidak dapat menghapus data yang sudah disetujui Admin.');
610:                 return;
611:             }
612:         }
613: 
614:         $('#tugas_hapusRowId').val(rowId);
615:         $('#tugas_hapusViewNomor').text(d.noSk);
616:         $('#tugas_inputKodeHapus').val('');
617:         $('#tugas_modalHapus').removeClass('hidden').addClass('flex').hide().fadeIn();
618:     }
619: 
620:     function tugas_handleSimpanHapus(e) {
621:         e.preventDefault();
622:         var kode = $('#tugas_inputKodeHapus').val();
623:         if (kode !== "HAPUS") { Sultan.alert('error', 'Kode Salah', 'Ketik "HAPUS" untuk konfirmasi.'); return; }
624: 
625:         var btn = $('#tugas_btnEksekusiHapus');
626:         btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i> MENGHAPUS...');
627: 
628:         google.script.run.withSuccessHandler(function (res) {
629:             if (res.success) {
630:                 Sultan.alert('success', 'Dihapus', 'Data telah dihapus dari database dan server.');
631:                 $('#tugas_modalHapus').fadeOut(function() { $(this).addClass('hidden').removeClass('flex'); });
632:                 tugas_tarikDataServer();
633:                 if (typeof sk_updateSidebarBadge === 'function') sk_updateSidebarBadge();
634:             } else {
635:                 Sultan.alert('error', 'Gagal Hapus', res.error || 'Terjadi kesalahan.');
636:                 btn.prop('disabled', false).html('<i class="fas fa-trash mr-1"></i> Hapus Permanen');
637:             }
638:         }).hapusSK($('#tugas_hapusRowId').val());
639:     }
640: 
641:     // =================================================================
642:     // 8. UTILITIES (Formatters, Diffs, etc)
643:     // =================================================================
644:     function tugas_bukaPreview(url) {
645:         if (!url) { Sultan.alert('error', 'File Kurang', 'Dokumen belum diunggah.'); return; }
646: 
647:         var dlUrl = url;
648:         if (url.includes('drive.google.com')) {
649:             var fileId = "";
650:             var parts = url.split('/file/d/');
651:             if (parts.length > 1) fileId = parts[1].split('/')[0];
652:             else { var idParts = url.split('id='); if (idParts.length > 1) fileId = idParts[1].split('&')[0]; }
653:             if (fileId) dlUrl = 'https://drive.google.com/uc?export=download&id=' + fileId;
654:         }
655: 
656:         $('#tugas_linkDownloadHeader').attr('href', dlUrl);
657:         $('#tugas_linkTabHeader').attr('href', url);
658:         $('#tugas_loadingPreviewPDF').removeClass('hidden');
659: 
660:         $('#tugas_framePreviewFull').addClass('hidden').attr('src', '');
661:         $('#tugas_modalPreview').removeClass('hidden').addClass('flex').hide().fadeIn();
662: 
663:         setTimeout(function () {
664:             $('#tugas_framePreviewFull').attr('src', tugas_convertDriveUrl(url));
665:         }, 100);
666: 
667:         $('#tugas_framePreviewFull').off('load').on('load', function () {
668:             $('#tugas_loadingPreviewPDF').addClass('d-none');
669:             $(this).removeClass('d-none');
670:         });
671:     }
672: 
673:     function tugas_convertDriveUrl(url) {
674:         if (!url) return "";
675:         try {
676:             var driveUrl = String(url).trim();
677:             if (driveUrl.includes('drive.google.com')) {
678:                 var fileId = "";
679:                 if (driveUrl.includes('/file/d/')) {
680:                     fileId = driveUrl.split('/file/d/')[1].split('/')[0].split('?')[0].split('&')[0];
681:                 } else if (driveUrl.includes('id=')) {
682:                     fileId = driveUrl.split('id=')[1].split('&')[0].split('#')[0];
683:                 }
684: 
685:                 if (fileId) {
686:                     return 'https://drive.google.com/file/d/' + fileId + '/preview';
687:                 }
688:             }
689:             return driveUrl;
690:         } catch (e) {
691:             console.error("URL Conversion Error:", e);
692:             return url;
693:         }
694:     }
695: 
696:     function tugas_buildBadgeStatus(st, ket) {
697:         st = String(st || "").toLowerCase(); ket = ket || "";
698:         var badge = "";
699:         if (st.includes('setuju') || st.includes('acc') || st.includes('ok') || st.includes('valid'))
700:             badge = '<span class="inline-flex rounded-full bg-success/10 py-1 px-3 text-[10px] font-bold text-success"><i class="fas fa-check-circle mr-1 mt-0.5"></i> DISETUJUI</span>';
701:         else if (st.includes('revisi'))
702:             badge = '<span class="inline-flex rounded-full bg-warning/10 py-1 px-3 text-[10px] font-bold text-warning"><i class="fas fa-redo-alt mr-1 mt-0.5"></i> REVISI</span>';
703:         else if (st.includes('tolak'))
704:             badge = '<span class="inline-flex rounded-full bg-danger/10 py-1 px-3 text-[10px] font-bold text-danger"><i class="fas fa-times-circle mr-1 mt-0.5"></i> DITOLAK</span>';
705:         else
706:             badge = '<span class="inline-flex rounded-full bg-primary/10 py-1 px-3 text-[10px] font-bold text-primary"><i class="fas fa-hourglass-half mr-1 mt-0.5"></i> DIPROSES</span>';
707: 
708:         if (ket && ket.trim().length > 2 && (st.includes('revisi') || st.includes('tolak'))) {
709:             var safeKet = tugas_escapeHtml(ket);
710:             badge += '<div class="mt-1"><button type="button" class="inline-flex rounded border border-danger p-1 text-[9px] font-bold text-danger hover:bg-danger hover:text-white transition tugas-btn-catatan" data-pesan="' + safeKet + '"><i class="fas fa-comment-dots mr-1"></i> Baca Catatan</button></div>';
711:         }
712:         return badge;
713:     }
714: 
715:     function tugas_parseDateTime(s) {
716:         if (!s || s === "-") return 0;
717:         try {
718:             var p = s.split(' '); var d = p[0].split('-'); var t = (p[1] || "00:00:00").split(':');
719:             return new Date(d[2], d[1] - 1, d[0], t[0], t[1], t[2]).getTime();
720:         } catch (e) { return 0; }
721:     }
722: 
723: 
724:     function tugas_renderSkeleton() {
725:         var $cont = $('#tugas_loadingState').empty();
726:         var $grid = $('<div/>', { "class": "flex flex-col gap-4 py-10" });
727:         for (var i = 0; i < 4; i++) {
728:             var $row = $('<div/>', { "class": "flex items-center gap-4 animate-pulse" });
729:             $row.append($('<div/>', { "class": "h-12 w-12 rounded-sm bg-gray-2 dark:bg-meta-4" }));
730:             var $meta = $('<div/>', { "class": "flex-1 space-y-2" });
731:             $meta.append($('<div/>', { "class": "h-4 w-1/3 rounded bg-gray-2 dark:bg-meta-4" }));
732:             $meta.append($('<div/>', { "class": "h-3 w-1/2 rounded bg-gray-2 dark:bg-meta-4 opacity-50" }));
733:             $row.append($meta);
734:             $grid.append($row);
735:         }
736:         $cont.append($grid);
737:         if (!$('#tugas_turboBadge').length) {
738:             $cont.append('<div id="tugas_turboBadge" style="display:none;" class="items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black text-primary uppercase shadow-sm"><i class="fas fa-bolt"></i> Cached Data</div>');
739:         }
740:     }
741: 
742:     function tugas_cleanText(t) { return tugas_escapeHtml(String(t || "").trim() || "-"); }
743:     function tugas_escapeHtml(text) {
744:         if (!text) return "";
745:         return String(text)
746:             .replace(/&/g, "&amp;")
747:             .replace(/</g, "&lt;")
748:             .replace(/>/g, "&gt;")
749:             .replace(/"/g, "&quot;")
750:             .replace(/'/g, "&#039;");
751:     }
752:     function tugas_escapeJs(t) {
753:         if (!t) return "";
754:         return String(t).replace(/'/g, "\\'").replace(/"/g, "\\\"");
755:     }
756: 
757: </script>
