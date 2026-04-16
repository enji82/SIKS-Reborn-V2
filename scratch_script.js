<script>
    // ======================================================================
    // ISOLASI VARIABEL GLOBAL (MASTER BLUEPRINT V8 - FULL COMPLIANCE)
    // ======================================================================
    var TUGAS_DATA_MASTER = {};
    var TUGAS_CACHE_DATA = [];
    var TUGAS_TABEL_INSTANCE = null;

    var TUGAS_USER_AKTIF = "";
    var TUGAS_IS_ADMIN = false;
    var TUGAS_USER_NPSN = "";
    var TUGAS_UNIT_TERKUNCI = "";

    var TUGAS_CURRENT_FILE_URL = "";
    var TUGAS_PREV_DATA_JSON = null; // Anti-flash Diff Check

    // =================================================================
    // 1. INITIALIZATION & SPA VACCINE (BAB I)
    // =================================================================
    $(document).ready(function () {
        TUGAS_TABEL_INSTANCE = null;
        $('#tugas_tableState').hide();
        tugas_renderSkeleton();
        $('#tugas_loadingState').show();

        try {
            var user = typeof getSesiUser === 'function' ? getSesiUser() : {};
            TUGAS_USER_AKTIF = user.nama_lengkap || user.fullname || user.nama || user.username || "User Web";
            TUGAS_IS_ADMIN = (user.role || "").toLowerCase().includes("admin");
            TUGAS_USER_NPSN = user.npsn || user.username || "";
        } catch (e) { TUGAS_USER_NPSN = ""; TUGAS_IS_ADMIN = false; }

        tugas_initFilterTahun();

        // VAKSINASI EVENT DELEGATION (ANTI MEMORY LEAK)
        $(document).off('change', '#tugas_filterUnit, #tugas_filterTahun, #tugas_filterSemester, #tugas_filterStatus').on('change', '#tugas_filterUnit, #tugas_filterTahun, #tugas_filterSemester, #tugas_filterStatus', tugas_terapkanFilterLokal);

        // VAKSIN TOMBOL CARI: Kini memanggil tugas_tarikDataServer secara mutlak (Bypass Cache)
        $(document).off('click', '#tugas_btnCari').on('click', '#tugas_btnCari', tugas_tarikDataServer);

        $(document).off('click', '#tugas_btnTambah').on('click', '#tugas_btnTambah', tugas_bukaModalTambah);
        $(document).off('change', '#tugas_inputNamaSd, #tugas_inputTahun, #tugas_inputSemester, #tugas_inputKriteria').on('change', '#tugas_inputNamaSd, #tugas_inputTahun, #tugas_inputSemester, #tugas_inputKriteria', tugas_cekKetersediaanSlot);
        $(document).off('submit', '#tugas_formUtama').on('submit', '#tugas_formUtama', tugas_handleSimpan);
        $(document).off('submit', '#tugas_formVerif').on('submit', '#tugas_formVerif', tugas_handleSimpanVerifikasi);
        $(document).off('submit', '#tugas_formHapus').on('submit', '#tugas_formHapus', tugas_handleSimpanHapus);
        $(document).off('change', '#tugas_verifStatus').on('change', '#tugas_verifStatus', function () { tugas_cekStatusVerif($(this).val()); });

        $(document).off('click', '.tugas-btn-catatan').on('click', '.tugas-btn-catatan', function () {
            var msg = $(this).data('pesan');
            statussk_lihatCatatanSultan(msg);
        });

        function statussk_lihatCatatanSultan(pesan) {
            Sultan.alert('info', 'Catatan Admin', pesan);
        }

        $(document).off('click', '#tugas_btnLihatDokumenLama').on('click', '#tugas_btnLihatDokumenLama', function (e) {
            e.preventDefault();
            tugas_bukaPreview(TUGAS_CURRENT_FILE_URL);
        });

        $(document).off('change', '#tugas_inputFile').on('change', '#tugas_inputFile', function (e) {
            var fileName = e.target.files[0] ? e.target.files[0].name : 'Pilih file PDF...';
            $(this).next('.custom-file-label').html('<i class="fas fa-check text-success mr-1"></i> ' + fileName).addClass('font-weight-bold text-success');
        });

        // Reset Modal (SPA Clean Up)
        $('#tugas_modalPreview').on('hidden.bs.modal', function () { $('#tugas_framePreviewFull').addClass('d-none').attr('src', ''); $('#tugas_loadingPreviewPDF').removeClass('d-none'); });
        $('#tugas_modalVerif').on('hidden.bs.modal', function () { $('#tugas_verifFrame').addClass('d-none').attr('src', ''); $('#tugas_verifNoFile').removeClass('d-none'); });

        tugas_validasiAksesUser();
    });

    function tugas_initFilterTahun() {
        var now = new Date(); var curYear = now.getFullYear(); var curMonth = now.getMonth();
        var htmlTahun = '<option value="">- Semua -</option>';
        var formTahun = '<option value="">- Pilih Tahun Ajaran -</option>';

        for (var y = 2021; y <= curYear + 1; y++) {
            var thnAjaran = y + "/" + (y + 1);
            htmlTahun += '<option value="' + thnAjaran + '">' + thnAjaran + '</option>';
            formTahun += '<option value="' + thnAjaran + '">' + thnAjaran + '</option>';
        }

        $('#tugas_filterTahun').html(htmlTahun).val("");
        $('#tugas_filterSemester').val("");
        $('#tugas_filterStatus').val("");
        $('#tugas_inputTahun').html(formTahun);
    }

    // =================================================================
    // 2. GATEKEEPER & AUTO-FILTER LOGIC
    // =================================================================
    function tugas_validasiAksesUser() {
        if (TUGAS_IS_ADMIN) {
            $('#tugas_loadingText').html('Mempersiapkan Database Admin...');
            $('#tugas_filterUnit').empty().append('<option value="SEMUA">- Semua Sekolah -</option>').prop('disabled', false).removeClass('bg-light text-maroon font-weight-bold');

            // AUTO-SET DEFAULT FILTER UNTUK ADMIN
            var now = new Date(); var curYear = now.getFullYear(); var curMonth = now.getMonth();
            var currentTa = (curMonth >= 6) ? curYear + '/' + (curYear + 1) : (curYear - 1) + '/' + curYear;
            var currentSmt = (curMonth >= 6) ? "Semester 1" : "Semester 2";
            $('#tugas_filterTahun').val(currentTa);
            $('#tugas_filterSemester').val(currentSmt);

            $('#tugas_btnCari, #tugas_btnTambah').prop('disabled', false);
            tugas_tarikDataServer();
        } else {
            if (!TUGAS_USER_NPSN) {
                $('#tugas_filterUnit').empty().append('<option value="">AKSES DITOLAK (NPSN KOSONG)</option>');
                $('#tugas_loadingText').html('<span class="text-danger"><i class="fas fa-ban mb-2"></i><br>Akses ditolak: Sesi login tidak valid.</span>');
                return;
            }
            google.script.run.withSuccessHandler(function (resUnit) {
                var dataUnit = JSON.parse(resUnit);
                if (dataUnit.error) {
                    $('#tugas_filterUnit').empty().append('<option value="">AKSES DITOLAK</option>');
                    $('#tugas_loadingText').html('<span class="text-danger"><i class="fas fa-exclamation-triangle mb-2"></i><br>' + tugas_escapeHtml(dataUnit.error) + '</span>');
                    return;
                }
                TUGAS_UNIT_TERKUNCI = dataUnit.unitKerja;
                $('#tugas_filterUnit').empty().append('<option value="' + tugas_escapeHtml(TUGAS_UNIT_TERKUNCI) + '">' + tugas_escapeHtml(TUGAS_UNIT_TERKUNCI) + '</option>').prop('disabled', true);
                $('#tugas_btnCari, #tugas_btnTambah').prop('disabled', false);
                tugas_tarikDataServer();
            }).withFailureHandler(function (err) {
                $('#tugas_filterUnit').empty().append('<option value="">ERROR SERVER</option>');
                $('#tugas_loadingText').html('<span class="text-danger"><i class="fas fa-wifi mb-2"></i><br>Koneksi Terputus: ' + tugas_escapeHtml(err.message) + '</span>');
            }).getUnitKerjaByNpsnPTK(TUGAS_USER_NPSN);
        }
    }

    // =================================================================
    // 3. FETCH DATA & FILTER (BAB VII - Turbo Seamless)
    // =================================================================
    function tugas_getLoaderHtml(msg) {
        return '<div class="sk-loader-wrapper"><div class="sk-spinner-premium"></div><div class="sk-loading-text">' + (msg || 'Memuat...') + '</div></div>';
    }

    function tugas_tarikDataServer() {
        var btn = $('#tugas_btnCari');
        var cacheKey = 'tugas_cache_full';

        btn.prop('disabled', true).html('<i class="fas fa-bolt fa-spin text-maroon"></i>');

        // TURBO LOGIC: Load from cache first
        var cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
            try {
                TUGAS_CACHE_DATA = JSON.parse(cachedData);
                tugas_renderTabel(TUGAS_CACHE_DATA);
                $('#tugas_loadingState').hide();
                $('#tugas_tableState').show();
                $('#tugas_turboBadge').css('display', 'flex').delay(2000).fadeOut();
            } catch (e) { sessionStorage.removeItem(cacheKey); }
        }

        if (!$.fn.DataTable.isDataTable('#tugas_tabelUtama') && !cachedData) {
            $('#tugas_tableState').hide();
            tugas_renderSkeleton();
            $('#tugas_loadingState').show();
        }

        google.script.run.withSuccessHandler(function (dataRes) {
            btn.prop('disabled', false).html('<i class="fas fa-sync-alt text-maroon"></i>');

            if (dataRes && !dataRes.error) {
                var freshDataJSON = JSON.stringify(dataRes);
                if (freshDataJSON === TUGAS_PREV_DATA_JSON) {
                    return;
                }

                TUGAS_CACHE_DATA = dataRes;
                sessionStorage.setItem(cacheKey, freshDataJSON);
                TUGAS_PREV_DATA_JSON = freshDataJSON;

                // Sultan Auto-Filter logic for Notifications
                if (typeof SK_GLOBAL_FILTER_PRESET !== 'undefined' && SK_GLOBAL_FILTER_PRESET) {
                    $('#tugas_filterStatus').val(SK_GLOBAL_FILTER_PRESET);
                    SK_GLOBAL_FILTER_PRESET = null; // Clear after use
                }

                TUGAS_TABEL_INSTANCE = $('#tugas_tabelUtama').DataTable({
                    "destroy": true, "ordering": false, "pageLength": 10, "autoWidth": false,
                    "deferRender": true, "responsive": false,
                    "dom": '<"row"<"col-sm-12"<"table-responsive custom-scrollbar"tr>>>' +
                           '<"flex flex-col md:flex-row justify-between items-center gap-4 mt-6"<"text-sm text-body"i><"pagination-wrapper"p>>',
                    "columnDefs": [
                        { "targets": 0, "className": "py-5 px-4 text-center", "width": "120px" },
                        { "targets": [1, 2, 3, 6, 7, 8], "className": "py-5 px-4 text-left" },
                        { "targets": [4, 5], "className": "py-5 px-4 text-center" }
                    ],
                    "language": { "url": "//cdn.datatables.net/plug-ins/1.10.25/i18n/Indonesian.json", "emptyTable": "Tidak ditemukan data SK." },
                    "drawCallback": function (settings) {
                        $('#tugas_tabelUtama tbody tr').addClass('hover:bg-gray-2 dark:hover:bg-meta-4 transition');
                    }
                });

                tugas_populateFilterOptions();
                tugas_terapkanFilterLokal();

                $('#tugas_loadingState').hide();
                $('#tugas_tableState').show();
                if (TUGAS_TABEL_INSTANCE) { setTimeout(function () { TUGAS_TABEL_INSTANCE.columns.adjust(); }, 50); }
            }
        }).withFailureHandler(function (e) {
            btn.prop('disabled', false).html('<i class="fas fa-sync-alt text-maroon"></i>');
            if (!TUGAS_CACHE_DATA.length) {
                $('#tugas_tableState').hide();
                $('#tugas_loadingState').show();
                $('#tugas_loadingText').html('<span class="text-danger">Koneksi Terputus.</span>');
            }
        }).getDaftarSK();
    }

    function tugas_populateFilterOptions() {
        var uniqueUnits = new Set();

        if (typeof DROPDOWN_STATIS !== 'undefined' && DROPDOWN_STATIS["NamaSD"]) {
            DROPDOWN_STATIS["NamaSD"].forEach(function (u) { uniqueUnits.add(u); });
        } else {
            TUGAS_CACHE_DATA.forEach(function (row) { if (row.namaSd) uniqueUnits.add(String(row.namaSd).trim()); });
        }

        var sortedUnits = Array.from(uniqueUnits).sort();

        if (TUGAS_IS_ADMIN) {
            var uHtml = '<option value="SEMUA">- Semua Sekolah-</option>';
            sortedUnits.forEach(function (u) { uHtml += '<option value="' + tugas_escapeHtml(u) + '">' + tugas_escapeHtml(u) + '</option>'; });
            var curUnit = $('#tugas_filterUnit').val();
            $('#tugas_filterUnit').html(uHtml);
            if (curUnit && uniqueUnits.has(curUnit)) $('#tugas_filterUnit').val(curUnit);
        }

        var formHtml = '<option value="">- Pilih Sekolah -</option>';
        sortedUnits.forEach(function (u) { formHtml += '<option value="' + tugas_escapeHtml(u) + '">' + tugas_escapeHtml(u) + '</option>'; });
        $('#tugas_inputNamaSd').html(formHtml);
        if (!TUGAS_IS_ADMIN && TUGAS_UNIT_TERKUNCI) {
            $('#tugas_inputNamaSd').val(TUGAS_UNIT_TERKUNCI).prop('disabled', true);
        }
    }

    // =================================================================
    // 4. INJEKSI DATA (Sorting Last Activity via Cache & Render)
    // =================================================================
    function tugas_terapkanFilterLokal() {
        if (!TUGAS_TABEL_INSTANCE) return;

        var fTh = String($('#tugas_filterTahun').val() || "");
        var fSm = String($('#tugas_filterSemester').val() || "");
        var fSt = String($('#tugas_filterStatus').val() || "").toLowerCase();

        var tAdminUnit = TUGAS_IS_ADMIN ? String($('#tugas_filterUnit').val() || "").toUpperCase() : "";
        var tUnitUser = String(TUGAS_UNIT_TERKUNCI || "").trim().toUpperCase();

        var hasil = TUGAS_CACHE_DATA.filter(function (row) {
            var rTh = String(row.tahun || "").trim();
            var rSm = String(row.semester || "").trim();
            var rSt = String(row.status || "").trim().toLowerCase();
            var rSd = String(row.namaSd || "").trim().toUpperCase();

            var passUnit = false;
            if (TUGAS_IS_ADMIN) { passUnit = (tAdminUnit === "SEMUA" || tAdminUnit === "" || rSd === tAdminUnit); }
            else { passUnit = (rSd === tUnitUser); }

            var passTh = (fTh === "" || rTh === fTh);
            var passSm = (fSm === "" || rSm === fSm);

            var passSt = true;
            if (fSt !== "") {
                if (fSt === "ok") passSt = (rSt.includes("ok") || rSt.includes("setuju") || rSt.includes("valid"));
                else if (fSt === "diproses") passSt = (rSt === "" || rSt === "diproses");
                else passSt = rSt.includes(fSt);
            }

            return passUnit && passTh && passSm && passSt;
        });

        tugas_renderTabel(hasil);
    }

    function tugas_renderTabel(data) {
        var dtArray = []; TUGAS_DATA_MASTER = {};

        // Pengurutan Tambahan di Frontend (Berdasarkan aktivitas terbaru)
        data.sort(function (a, b) {
            var timeA = Math.max(tugas_parseDateTime(a.tglUnggah), tugas_parseDateTime(a.tglUpdate), tugas_parseDateTime(a.tglVerval));
            var timeB = Math.max(tugas_parseDateTime(b.tglUnggah), tugas_parseDateTime(b.tglUpdate), tugas_parseDateTime(b.tglVerval));
            return timeB - timeA;
        });

        data.forEach(function (row) {
            var id = String(row.rowBaris);
            TUGAS_DATA_MASTER[id] = row;

            var safeNoSk = tugas_cleanText(row.noSk || "-");
            var safeUrl = String(row.fileUrl || "").replace(/'/g, "%27").replace(/"/g, "%22");
            var safeUrlJs = tugas_escapeJs(safeUrl);
            var stButton = String(row.status || "").toLowerCase();
            var isApproved = (stButton.includes('setuju') || stButton.includes('ok') || stButton.includes('valid'));

            var badgeStatus = tugas_buildBadgeStatus(row.status, row.keterangan);

            // 1. Tombol Aksi (Individual 3 Buttons - SULTAN STYLE)
            var actionButtons = '<div class="flex items-center justify-center gap-2">' +
                '<button type="button" class="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm group" onclick="' + (TUGAS_IS_ADMIN ? "tugas_bukaModalVerif('" + id + "')" : "tugas_bukaPreview('" + safeUrlJs + "')") + '" title="' + (TUGAS_IS_ADMIN ? 'Verifikasi' : 'Pratinjau') + '">' +
                '<i class="fas ' + (TUGAS_IS_ADMIN ? 'fa-check-double' : 'fa-eye') + ' text-sm group-hover:scale-110"></i>' +
                '</button>' +
                '<button type="button" class="flex h-9 w-9 items-center justify-center rounded-xl border border-warning/20 bg-warning/5 text-warning hover:bg-warning hover:text-white transition-all shadow-sm group ' + (isApproved ? 'opacity-30 cursor-not-allowed' : '') + '" onclick="' + (isApproved ? 'void(0)' : "tugas_bukaModalEdit('" + id + "')") + '" title="Edit Data">' +
                '<i class="fas fa-pencil-alt text-sm group-hover:scale-110"></i>' +
                '</button>' +
                '<button type="button" class="flex h-9 w-9 items-center justify-center rounded-xl border border-danger/20 bg-danger/5 text-danger hover:bg-danger hover:text-white transition-all shadow-sm group ' + (isApproved ? 'opacity-30 cursor-not-allowed' : '') + '" onclick="' + (isApproved ? 'void(0)' : "tugas_bukaModalHapus('" + id + "')") + '" title="Hapus Data">' +
                '<i class="fas fa-trash-alt text-sm group-hover:scale-110"></i>' +
                '</button>' +
                '</div>';

            // 2. Format Tanggal SK
            var tglSkDisplay = row.tglSkDisplay || row.tglSk || "-";
            if (tglSkDisplay.match(/^\d{4}-\d{2}-\d{2}$/)) {
                var p = tglSkDisplay.split('-'); tglSkDisplay = p[2] + '-' + p[1] + '-' + p[0];
            }

            // 3. Tombol Dokumen
            var btnDokumen = safeUrl.length > 5 ? '<button type="button" class="inline-flex rounded-full bg-danger/10 py-1.5 px-4 text-[10px] font-black uppercase tracking-widest text-danger transition hover:bg-danger hover:text-white shadow-sm" onclick="tugas_bukaPreview(\'' + safeUrlJs + '\')"><i class="fas fa-file-pdf mr-2"></i> LIHAT PDF</button>' : '-';

            // 4. Log Detils
            var uiDikirim = '<div class="flex flex-col"><span class="text-[11px] font-black text-black dark:text-white">' + (row.tglUnggah || '-') + '</span><span class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">' + (row.userInput || '-') + '</span></div>';
            var uiDiubah = row.tglUpdate && row.tglUpdate !== '-' ? '<div class="flex flex-col"><span class="text-[11px] font-black text-black dark:text-white">' + row.tglUpdate + '</span><span class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">' + (row.userUpdate || '-') + '</span></div>' : '-';
            var uiVerif = row.tglVerval && row.tglVerval !== '-' ? '<div class="flex flex-col"><span class="text-[11px] font-black text-primary">' + row.tglVerval + '</span><span class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">' + (row.verifikator || '-') + '</span></div>' : '-';

            // KOMBINASI KOLOM
            var uiUnit = '<div class="text-[11px] font-black text-black dark:text-white leading-tight uppercase">' + tugas_cleanText(row.namaSd) + '</div><div class="text-[9px] font-bold text-gray-400">' + tugas_cleanText(row.npsn || '-') + '</div>';
            var uiTahunSem = '<div class="text-[11px] font-black text-black dark:text-white">' + tugas_cleanText(row.tahun) + '</div><div class="text-[10px] text-primary font-black uppercase tracking-tighter">' + tugas_cleanText(row.semester) + '</div>';
            var uiSkDetail = '<div class="text-[11px] font-black text-black dark:text-white leading-tight">' + safeNoSk + '</div>' +
                '<div class="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter flex items-center gap-1"><i class="far fa-calendar-alt opacity-60"></i> ' + tglSkDisplay + ' &bull; <span class="text-primary">' + tugas_cleanText(row.kriteria) + '</span></div>';

            dtArray.push([
                actionButtons,
                uiUnit,
                uiTahunSem,
                uiSkDetail,
                btnDokumen,
                badgeStatus,
                uiDikirim,
                uiDiubah,
                uiVerif
            ]);
        });

        TUGAS_TABEL_INSTANCE.clear().rows.add(dtArray).draw(false);
    }

    // =================================================================
    // 5. LOGIKA MODAL FORM & VALIDASI (BAB V)
    // =================================================================
    function tugas_resetForm() {
        $('#tugas_formUtama')[0].reset();
        $('#tugas_editRowId').val('');
        TUGAS_CURRENT_FILE_URL = "";
        $('#tugas_linkFileLama').addClass('hidden');
        $('#tugas_labelFile').html('<i class="fas fa-file-pdf text-danger mr-1"></i> Unggah Dokumen Asli <span class="text-danger">*</span>');
        $('.custom-file-label').removeClass("selected text-success font-weight-bold").html('Pilih file PDF...');
        $('#tugas_areaTerkunci').prop('disabled', true).css('opacity', '0.5');
        $('#tugas_inputNamaSd, #tugas_inputTahun, #tugas_inputSemester, #tugas_inputKriteria').prop('disabled', false).removeClass('bg-light');
        $('#tugas_btnSimpanForm').removeClass('btn-sultan-indigo').addClass('btn-sultan-maroon').show().prop('disabled', true);
        $('#tugas_alertInfo').removeClass('alert-danger alert-success').addClass('alert-info border-info').html('<i class="fas fa-info-circle mr-1"></i> Tentukan <b>Sekolah, Tahun, Semester,</b> dan <b>Kriteria</b> untuk memulai pengisian data SK.');
    }

    function tugas_bukaModalTambah() {
        tugas_resetForm();
        $('#tugas_modalForm .modal-header').removeClass('sultan-header-indigo').addClass('sultan-header-navy');
        $('#tugas_judulModalForm').html('<i class="fas fa-plus-circle mr-2"></i> Tambah SK Pembagian Tugas');
        $('#tugas_btnSimpanForm').html('<i class="fas fa-save mr-2"></i> SIMPAN DATA SK').removeClass('btn-sultan-indigo').addClass('btn-sultan-maroon');

        var now = new Date(); var curYear = now.getFullYear(); var curMonth = now.getMonth();
        var currentTa = (curMonth >= 6) ? curYear + '/' + (curYear + 1) : (curYear - 1) + '/' + curYear;
        var currentSmt = (curMonth >= 6) ? "Semester 1" : "Semester 2";
        $('#tugas_inputTahun').val(currentTa);
        $('#tugas_inputSemester').val(currentSmt);
        if (!TUGAS_IS_ADMIN && TUGAS_UNIT_TERKUNCI) { $('#tugas_inputNamaSd').val(TUGAS_UNIT_TERKUNCI); }

        $('#tugas_modalForm').removeClass('hidden').addClass('flex').hide().fadeIn();
    }

    function tugas_cekKetersediaanSlot() {
        var vSd = $('#tugas_inputNamaSd').val();
        var vTh = $('#tugas_inputTahun').val();
        var vSm = $('#tugas_inputSemester').val();
        var vKr = $('#tugas_inputKriteria').val();

        if (!vSd || !vTh || !vSm || !vKr) {
            $('#tugas_areaTerkunci').prop('disabled', true).css('opacity', '0.5');
            $('#tugas_btnSimpanForm').hide().prop('disabled', true);
            $('#tugas_alertInfo').removeClass('alert-danger alert-success').addClass('alert-info border-info').html('<i class="fas fa-info-circle mr-1"></i> Harap lengkapi semua kolom di atas.');
            return;
        }

        $('#tugas_alertInfo').removeClass('alert-danger alert-success').addClass('alert-info border-info').html('<i class="fas fa-spinner fa-spin mr-1"></i> Mengecek data di server.');

        var payload = { namaSd: vSd, tahunAjaran: vTh, semester: vSm, kriteria: vKr };

        google.script.run.withSuccessHandler(function (res) {
            var currentId = $('#tugas_editRowId').val();

            if (res.found) {
                if (currentId && String(res.data.rowId) === String(currentId)) {
                    $('#tugas_areaTerkunci').prop('disabled', false).css('opacity', '1');
                    $('#tugas_btnSimpanForm').show().prop('disabled', false).html('<i class="fas fa-save mr-1"></i> UPDATE DATA');
                    $('#tugas_alertInfo').removeClass('alert-info alert-danger').addClass('alert-success border-success').html('<i class="fas fa-check-circle mr-1"></i> Mode Edit aktif.');
                } else {
                    $('#tugas_areaTerkunci').prop('disabled', true).css('opacity', '0.5');
                    $('#tugas_btnSimpanForm').hide().prop('disabled', true);
                    $('#tugas_alertInfo').removeClass('alert-info alert-success').addClass('alert-danger border-danger').html('<i class="fas fa-check-circle mr-1"></i> <b>Data ditemukan:</b> Sekolah ini sudah memiliki SK untuk ' + vKr + ' pada ' + vSm + ' TA ' + vTh + '.');
                }
            } else {
                $('#tugas_areaTerkunci').prop('disabled', false).css('opacity', '1');
                $('#tugas_btnSimpanForm').show().prop('disabled', false).html('<i class="fas fa-save mr-1"></i> SIMPAN DOKUMEN');
                $('#tugas_alertInfo').removeClass('alert-info alert-danger').addClass('alert-success border-success').html('<i class="fas fa-info-circle mr-1"></i> <b>Data belum diinput:</b> Silakan lanjutkan pengisian Nomor SK dan unggah dokumen.');
                if (!currentId) $('#tugas_inputNoSk').focus();
            }
        }).cekDuplikatSK(payload);
    }

    function tugas_bukaModalEdit(rowId) {
        tugas_resetForm();
        var rowData = TUGAS_DATA_MASTER[rowId];
        if (!rowData) return;

        $('#tugas_modalForm .modal-header').removeClass('sultan-header-navy').addClass('sultan-header-indigo');
        $('#tugas_judulModalForm').html('<i class="fas fa-edit mr-2"></i> Edit Data SK Pembagian Tugas');
        $('#tugas_editRowId').val(rowId);

        $('#tugas_btnSimpanForm').removeClass('btn-sultan-maroon').addClass('btn-sultan-indigo');

        $('#tugas_inputNamaSd').val(rowData.namaSd);
        $('#tugas_inputTahun').val(rowData.tahun);
        $('#tugas_inputSemester').val(rowData.semester);
        $('#tugas_inputKriteria').val(rowData.kriteria);

        $('#tugas_inputNoSk').val(rowData.noSk);
        $('#tugas_inputTglSk').val(rowData.tglSk ? rowData.tglSk.substring(0, 10) : "");

        TUGAS_CURRENT_FILE_URL = rowData.fileUrl || "";
        if (TUGAS_CURRENT_FILE_URL) {
            $('#tugas_linkFileLama').removeClass('d-none');
            $('#tugas_labelFile').html('<i class="fas fa-file-pdf text-danger mr-1"></i> Ganti Dokumen (Opsional)');
        }

        $('#tugas_inputNamaSd, #tugas_inputTahun, #tugas_inputSemester, #tugas_inputKriteria').prop('disabled', true).addClass('bg-light');
        $('#tugas_areaTerkunci').prop('disabled', false).css('opacity', '1');
        $('#tugas_btnSimpanForm').show().prop('disabled', false).html('<i class="fas fa-save mr-2"></i> UPDATE DATA SK');
        $('#tugas_alertInfo').removeClass('bg-primary/5 text-primary').addClass('bg-meta-3/5 text-meta-3').html('<p class="text-sm font-medium"><i class="fas fa-check-circle mr-1"></i> Data siap diubah.</p>');
        $('#tugas_modalForm').removeClass('hidden').addClass('flex').hide().fadeIn();
    }

    function tugas_handleSimpan(e) {
        e.preventDefault();

        var btn = $('#tugas_btnSimpanForm');
        var btnTxt = btn.html();
        var rowId = $('#tugas_editRowId').val();

        // Validasi File jika data baru
        if (!rowId && !$('#tugas_inputFile')[0].files[0]) { Sultan.alert('error', 'Dokumen Wajib', 'Harap pilih file PDF SK untuk diunggah.'); return; }

        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i> MEMPROSES...');

        var fileInput = $('#tugas_inputFile')[0];
        if (fileInput.files.length > 0) {
            var file = fileInput.files[0];
            if (file.size > 1024 * 1024) { Sultan.alert('error', 'File Terlalu Besar', 'Maksimal ukuran file adalah 1 MB.'); btn.prop('disabled', false).html(btnTxt); return; }

            var reader = new FileReader();
            reader.onload = function (e) {
                var base64Data = e.target.result.split(',')[1];
                tugas_kirimDataServer(rowId, base64Data, file.name);
            };
            reader.readAsDataURL(file);
        } else {
            tugas_kirimDataServer(rowId, null, null);
        }
    }

    function tugas_kirimDataServer(rowId, base64, fileName) {
        var payload = {
            editRowId: rowId,
            namaSd: $('#tugas_inputNamaSd').val(),
            tahunAjaran: $('#tugas_inputTahun').val(),
            semester: $('#tugas_inputSemester').val(),
            kriteriaSk: $('#tugas_inputKriteria').val(),
            nomorSk: $('#tugas_inputNoSk').val(),
            tanggalSk: $('#tugas_inputTglSk').val(),
            userInput: TUGAS_USER_AKTIF,
            userUpdate: TUGAS_USER_AKTIF,
            fileData: base64 ? { data: base64.split(',')[1], mimeType: 'application/pdf' } : null
        };

        var serverFunction = rowId ? "simpanPerubahanSK" : "processManualForm";

        google.script.run.withSuccessHandler(function (res) {
            if (res.success) {
                $('#tugas_modalForm').fadeOut(function() { $(this).addClass('hidden').removeClass('flex'); });
                Sultan.alert('success', 'Berhasil', rowId ? 'Data berhasil diperbarui.' : 'Data berhasil disimpan.');
                tugas_tarikDataServer();
                if (typeof sk_updateSidebarBadge === 'function') sk_updateSidebarBadge();
            } else {
                Sultan.alert('error', 'Gagal', res.error || res.message || 'Terjadi kesalahan sistem.');
                $('#tugas_btnSimpanForm').prop('disabled', false).html(rowId ? '<i class="fas fa-save mr-2"></i> UPDATE DATA SK' : '<i class="fas fa-save mr-2"></i> SIMPAN DATA SK');
            }
        })[serverFunction](payload);
    }

    // =================================================================
    // 6. LOGIKA VERIFIKASI (ADMIN ONLY)
    // =================================================================
    function tugas_bukaModalVerif(rowId) {
        var d = TUGAS_DATA_MASTER[rowId];
        if (!d) return;

        $('#tugas_verifRowId').val(rowId);
        $('#tugas_vNamaSd').text(d.namaSd);
        $('#tugas_vTahun').text(d.tahun);
        $('#tugas_vSemester').text(d.semester);
        $('#tugas_vKriteria').text(d.kriteria);
        $('#tugas_vNoSk').text(d.noSk);

        var tgl = d.tglSkDisplay || d.tglSk || "-";
        $('#tugas_vTglSk').text(tgl);

        $('#tugas_verifStatus').val('');
        $('#tugas_verifKeterangan').val(d.keterangan || '');
        $('#tugas_verifWajibCatatan').addClass('d-none');

        var url = d.fileUrl || "";
        if (url) {
            $('#tugas_verifLoader').removeClass('d-none');
            // Clear src first to force re-load
            $('#tugas_verifFrame').addClass('d-none').attr('src', '');
            setTimeout(function () {
                $('#tugas_verifFrame').attr('src', tugas_convertDriveUrl(url));
            }, 100);
            $('#tugas_verifNoFile').addClass('d-none');

            $('#tugas_verifFrame').off('load').on('load', function () {
                $('#tugas_verifLoader').addClass('d-none');
                $(this).removeClass('d-none');
            });
            });
        } else {
            $('#tugas_verifLoader').addClass('hidden');
            $('#tugas_verifFrame').addClass('hidden');
            $('#tugas_verifNoFile').removeClass('hidden');
        }

        $('#tugas_modalVerif').removeClass('hidden').addClass('flex').hide().fadeIn();
    }

    function tugas_cekStatusVerif(val) {
        if (val === "Revisi" || val === "Ditolak") {
            $('#tugas_verifWajibCatatan').removeClass('d-none');
        } else {
            $('#tugas_verifWajibCatatan').addClass('d-none');
        }
    }

    function tugas_handleSimpanVerifikasi(e) {
        e.preventDefault();
        var status = $('#tugas_verifStatus').val();
        var catatan = $('#tugas_verifKeterangan').val();

        if ((status === "Revisi" || status === "Ditolak") && !catatan.trim()) {
            $('#tugas_verifWajibCatatan').removeClass('d-none');
            Sultan.alert('warning', 'Catatan Wajib', 'Harap isi alasan revisi atau penolakan.');
            return;
        }

        var btn = $('#tugas_btnSimpanVerif');
        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i> EKSEKUSI...');

        var payload = {
            verifRowId: $('#tugas_verifRowId').val(),
            verifStatus: status,
            verifKeterangan: catatan,
            verifikator: TUGAS_USER_AKTIF
        };

        google.script.run.withSuccessHandler(function (res) {
            if (res.success) {
                $('#tugas_modalVerif').fadeOut(function() { $(this).addClass('hidden').removeClass('flex'); });
                Sultan.alert('success', 'Verifikasi Berhasil', 'Status SK telah diperbarui.');
                tugas_tarikDataServer();
                if (typeof sk_updateSidebarBadge === 'function') sk_updateSidebarBadge();
            } else {
                Sultan.alert('error', 'Gagal Verifikasi', res.message || 'Terjadi kesalahan.');
                btn.prop('disabled', false).html('<i class="fas fa-check-double mr-2"></i> Eksekusi');
            }
        }).verifikasiDataSK(payload);
    }

    // =================================================================
    // 7. LOGIKA HAPUS DATA (ADMIN ONLY)
    // =================================================================
    function tugas_bukaModalHapus(rowId) {
        var d = TUGAS_DATA_MASTER[rowId];
        if (!d) return;

        if (!TUGAS_IS_ADMIN) {
            var st = String(rowId.status || "").toLowerCase();
            if (st.includes('ok') || st.includes('setuju') || st.includes('valid')) {
                Sultan.alert('error', 'Terkunci', 'Anda tidak dapat menghapus data yang sudah disetujui Admin.');
                return;
            }
        }

        $('#tugas_hapusRowId').val(rowId);
        $('#tugas_hapusViewNomor').text(d.noSk);
        $('#tugas_inputKodeHapus').val('');
        $('#tugas_modalHapus').removeClass('hidden').addClass('flex').hide().fadeIn();
    }

    function tugas_handleSimpanHapus(e) {
        e.preventDefault();
        var kode = $('#tugas_inputKodeHapus').val();
        if (kode !== "HAPUS") { Sultan.alert('error', 'Kode Salah', 'Ketik "HAPUS" untuk konfirmasi.'); return; }

        var btn = $('#tugas_btnEksekusiHapus');
        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i> MENGHAPUS...');

        google.script.run.withSuccessHandler(function (res) {
            if (res.success) {
                Sultan.alert('success', 'Dihapus', 'Data telah dihapus dari database dan server.');
                $('#tugas_modalHapus').fadeOut(function() { $(this).addClass('hidden').removeClass('flex'); });
                tugas_tarikDataServer();
                if (typeof sk_updateSidebarBadge === 'function') sk_updateSidebarBadge();
            } else {
                Sultan.alert('error', 'Gagal Hapus', res.error || 'Terjadi kesalahan.');
                btn.prop('disabled', false).html('<i class="fas fa-trash mr-1"></i> Hapus Permanen');
            }
        }).hapusSK($('#tugas_hapusRowId').val());
    }

    // =================================================================
    // 8. UTILITIES (Formatters, Diffs, etc)
    // =================================================================
    function tugas_bukaPreview(url) {
        if (!url) { Sultan.alert('error', 'File Kurang', 'Dokumen belum diunggah.'); return; }

        var dlUrl = url;
        if (url.includes('drive.google.com')) {
            var fileId = "";
            var parts = url.split('/file/d/');
            if (parts.length > 1) fileId = parts[1].split('/')[0];
            else { var idParts = url.split('id='); if (idParts.length > 1) fileId = idParts[1].split('&')[0]; }
            if (fileId) dlUrl = 'https://drive.google.com/uc?export=download&id=' + fileId;
        }

        $('#tugas_linkDownloadHeader').attr('href', dlUrl);
        $('#tugas_linkTabHeader').attr('href', url);
        $('#tugas_loadingPreviewPDF').removeClass('hidden');

        $('#tugas_framePreviewFull').addClass('hidden').attr('src', '');
        $('#tugas_modalPreview').removeClass('hidden').addClass('flex').hide().fadeIn();

        setTimeout(function () {
            $('#tugas_framePreviewFull').attr('src', tugas_convertDriveUrl(url));
        }, 100);

        $('#tugas_framePreviewFull').off('load').on('load', function () {
            $('#tugas_loadingPreviewPDF').addClass('d-none');
            $(this).removeClass('d-none');
        });
    }

    function tugas_convertDriveUrl(url) {
        if (!url) return "";
        try {
            var driveUrl = String(url).trim();
            if (driveUrl.includes('drive.google.com')) {
                var fileId = "";
                if (driveUrl.includes('/file/d/')) {
                    fileId = driveUrl.split('/file/d/')[1].split('/')[0].split('?')[0].split('&')[0];
                } else if (driveUrl.includes('id=')) {
                    fileId = driveUrl.split('id=')[1].split('&')[0].split('#')[0];
                }

                if (fileId) {
                    return 'https://drive.google.com/file/d/' + fileId + '/preview';
                }
            }
            return driveUrl;
        } catch (e) {
            console.error("URL Conversion Error:", e);
            return url;
        }
    }

    function tugas_buildBadgeStatus(st, ket) {
        st = String(st || "").toLowerCase(); ket = ket || "";
        var badge = "";
        if (st.includes('setuju') || st.includes('acc') || st.includes('ok') || st.includes('valid'))
            badge = '<span class="inline-flex rounded-full bg-success/10 py-1 px-3 text-[10px] font-bold text-success"><i class="fas fa-check-circle mr-1 mt-0.5"></i> DISETUJUI</span>';
        else if (st.includes('revisi'))
            badge = '<span class="inline-flex rounded-full bg-warning/10 py-1 px-3 text-[10px] font-bold text-warning"><i class="fas fa-redo-alt mr-1 mt-0.5"></i> REVISI</span>';
        else if (st.includes('tolak'))
            badge = '<span class="inline-flex rounded-full bg-danger/10 py-1 px-3 text-[10px] font-bold text-danger"><i class="fas fa-times-circle mr-1 mt-0.5"></i> DITOLAK</span>';
        else
            badge = '<span class="inline-flex rounded-full bg-primary/10 py-1 px-3 text-[10px] font-bold text-primary"><i class="fas fa-hourglass-half mr-1 mt-0.5"></i> DIPROSES</span>';

        if (ket && ket.trim().length > 2 && (st.includes('revisi') || st.includes('tolak'))) {
            var safeKet = tugas_escapeHtml(ket);
            badge += '<div class="mt-1"><button type="button" class="inline-flex rounded border border-danger p-1 text-[9px] font-bold text-danger hover:bg-danger hover:text-white transition tugas-btn-catatan" data-pesan="' + safeKet + '"><i class="fas fa-comment-dots mr-1"></i> Baca Catatan</button></div>';
        }
        return badge;
    }

    function tugas_parseDateTime(s) {
        if (!s || s === "-") return 0;
        try {
            var p = s.split(' '); var d = p[0].split('-'); var t = (p[1] || "00:00:00").split(':');
            return new Date(d[2], d[1] - 1, d[0], t[0], t[1], t[2]).getTime();
        } catch (e) { return 0; }
    }


    function tugas_renderSkeleton() {
        var $cont = $('#tugas_loadingState').empty();
        var $grid = $('<div/>', { "class": "flex flex-col gap-4 py-10" });
        for (var i = 0; i < 4; i++) {
            var $row = $('<div/>', { "class": "flex items-center gap-4 animate-pulse" });
            $row.append($('<div/>', { "class": "h-12 w-12 rounded-sm bg-gray-2 dark:bg-meta-4" }));
            var $meta = $('<div/>', { "class": "flex-1 space-y-2" });
            $meta.append($('<div/>', { "class": "h-4 w-1/3 rounded bg-gray-2 dark:bg-meta-4" }));
            $meta.append($('<div/>', { "class": "h-3 w-1/2 rounded bg-gray-2 dark:bg-meta-4 opacity-50" }));
            $row.append($meta);
            $grid.append($row);
        }
        $cont.append($grid);
        if (!$('#tugas_turboBadge').length) {
            $cont.append('<div id="tugas_turboBadge" style="display:none;" class="items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black text-primary uppercase shadow-sm"><i class="fas fa-bolt"></i> Cached Data</div>');
        }
    }

    function tugas_cleanText(t) { return tugas_escapeHtml(String(t || "").trim() || "-"); }
    function tugas_escapeHtml(text) {
        if (!text) return "";
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    function tugas_escapeJs(t) {
        if (!t) return "";
        return String(t).replace(/'/g, "\\'").replace(/"/g, "\\\"");
    }

</script>