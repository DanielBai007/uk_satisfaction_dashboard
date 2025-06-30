// 全局变量
let allData = []; // 所有数据
let filteredData = []; // 筛选后的数据
let uniqueLabels = []; // 所有唯一标签
let currentPage = 1;
const rowsPerPage = 10;
let teacherData = []; // 主讲老师数据
let teacherMapping = {}; // 场次ID到主讲老师的映射
let teacherSessionMapping = {}; // 场次ID到场次时间的映射
let teacherStatsData = {}; // 主讲老师统计数据
let teacherAverageStats = {}; // 主讲老师平均值统计
let sessionStatsData = {}; // 场次统计数据

// 评分和标签的映射关系
const scoreLabelsMap = {
    '1': ['讲解混乱', '有点无聊', '每次都拖堂'],
    '2': ['讲解模糊', '比较普通', '经常会拖堂'],
    '3': ['讲解到位', '还算生动', '有时会拖堂'],
    '4': ['讲解很清楚', '比较有趣', '几乎不拖堂'],
    '5': ['讲解很透彻', '非常幽默', '从来不拖堂']
};

// 字段映射配置（用于适配不同数据源的字段名）
const fieldMapping = {
    // 场次ID可能的字段名，按优先级排序
    sessionIdFields: ['plan_id', 'session_id', 'classId', 'class_id', 'courseId', 'course_id']
};

// 设备型号与品牌的对应关系
const deviceBrandMap = [
    { pattern: /^iPad|^iPhone/, brand: '苹果', examples: ['iPad11,3', 'iPhone13,2'] },
    { pattern: /^macOS/, brand: '苹果', examples: ['macOS 10.16'] },
    { pattern: /^AGS|^BAH|^SCM|^BTK-W00|^TGR-W10|^SCM-W09/, brand: '华为平板', examples: ['AGS5-W00', 'BAH3-W09', 'SCM-W09'] },
    { pattern: /^MRX|^BKY|^HEY/, brand: '荣耀', examples: ['MRX-W29', 'BKY-W10', 'HEY-W09'] },
    { pattern: /^BLA|^EML|^NOH/, brand: '华为手机', examples: ['BLA-AL00', 'EML-AL00', 'NOH-AN00'] },
    { pattern: /^P[A-Z]+M\d+/, brand: 'OPPO', examples: ['PBAM00', 'PCAT00', 'PCHM10'] },
    { pattern: /^RMX/, brand: 'realme', examples: ['RMX2111', 'RMX3121', 'RMX3366'] },
    { pattern: /^V\d+/, brand: 'vivo', examples: ['V2046A', 'V2154A', 'V2283A'] },
    { pattern: /^vivo/, brand: 'vivo', examples: ['vivo X9', 'vivo Y79'] },
    { pattern: /^M20\d+/, brand: '小米', examples: ['M2002J9E', 'M2007J1SC'] },
    { pattern: /^Mi|^MIX|^MI PAD/, brand: '小米', examples: ['Mi 10', 'MIX 2S', 'MI PAD 4'] },
    { pattern: /^Redmi/, brand: '红米', examples: ['Redmi K30', 'Redmi Note 8 Pro'] },
    { pattern: /^Windows/, brand: 'Windows', examples: ['Windows 10', 'Windows 11'] },
    { pattern: /^SM-/, brand: '三星', examples: ['SM-N9860', 'SM-T715C', 'SM-X610'] },
    { pattern: /^Lenovo TB-/, brand: '联想', examples: ['Lenovo TB-J606F', 'Lenovo TB-J716F'] },
    { pattern: /^ZTE/, brand: '中兴', examples: ['ZTE 7532N', 'ZTE A2022H'] },
    { pattern: /^Readboy_/, brand: '读书郎', examples: ['Readboy_C10Pro', 'Readboy_C18'] },
    { pattern: /^ONEPLUS/, brand: '一加', examples: ['ONEPLUS A6000'] },
    { pattern: /^LE/, brand: '一加', examples: ['LE2100'] },
    { pattern: /^ASUS/, brand: '华硕', examples: ['ASUS_I005DA'] },
    { pattern: /^TB/, brand: '华硕/联想', examples: ['TB320FC', 'TB138FC'] },
    { pattern: /^TYH/, brand: '天语', examples: ['TYH622M', 'TYH631M'] },
    { pattern: /^ALP|^ANA|^ANY/, brand: '华为/荣耀', examples: ['ALP-AL00', 'ANA-AN00', 'ANY-AN00'] },
    { pattern: /^WLZ|^WKG|^WGR/, brand: '华为/荣耀', examples: ['WLZ-AN00', 'WKG-AN00', 'WGR-W09'] },
    { pattern: /^TAS|^TET|^TNH/, brand: '华为/荣耀', examples: ['TAS-AL00', 'TET-AN00', 'TNH-AN00'] },
    { pattern: /^ud710|^ums9620/, brand: '紫光展锐', examples: ['ud710_sa30_native', 'ums9620_se50_s30pro'] },
    { pattern: /^ROD|^ROL|^RVL/, brand: '华为/荣耀', examples: ['ROD-W09', 'ROL-W00', 'RVL-AL09'] },
    { pattern: /^KOZ|^KRJ|^KYD/, brand: '华为/荣耀', examples: ['KOZ-AL00', 'KRJ-W09', 'KYD-G1S'] },
    { pattern: /^2\d+/, brand: '小米/红米', examples: ['2206122SC', '22041211AC'] },
    { pattern: /^EBEN/, brand: '忆百', examples: ['EBEN T12Max', 'EBEN T12m'] },
    { pattern: /^XD-/, brand: '小度', examples: ['XD-SDB21-2301', 'XD-SDD24-2301'] },
    { pattern: /^YXP/, brand: '壹向屏', examples: ['YXP U-2303A', 'YXP U-2404A'] },
    { pattern: /^DBY-W09|^DBY2-W00/, brand: '华为', examples: ['M2002J9E'] }
];

// DOM 元素
const fileUpload = document.getElementById('file-upload');
const teacherFileUpload = document.getElementById('teacher-file-upload');
const uploadBtn = document.getElementById('upload-btn');
const loadingElement = document.getElementById('loading');
const dashboardElement = document.getElementById('dashboard');
const detailedDataElement = document.getElementById('detailed-data');
const commentsSection = document.getElementById('comments-section');
const teacherAnalysisElement = document.getElementById('teacher-analysis');
const labelFilterElement = document.getElementById('label-filter');
const scoreFilterElement = document.getElementById('score-filter');
const contentFilterElement = document.getElementById('content-filter');
const filterBtn = document.getElementById('filter-btn');
const tableBodyElement = document.getElementById('table-body');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfoElement = document.getElementById('page-info');

// 上传区域元素
const uploadSection = document.getElementById('upload-section');
const uploadContent = document.getElementById('upload-content');
const uploadCollapsed = document.getElementById('upload-collapsed');
const minimizeBtn = document.getElementById('minimize-btn');
const expandBtn = document.getElementById('expand-btn');
const floatingBtn = document.getElementById('floating-btn');
const reuploadBtn = document.getElementById('reupload-btn');
const fileInfo = document.getElementById('file-info');
const selectedFilename = document.getElementById('selected-filename');
const collapsedFilename = document.getElementById('collapsed-filename');
const changeFileBtn = document.getElementById('change-file-btn');
const fileUploadArea = document.querySelector('.file-upload-area');

// 主讲老师文件相关DOM元素
const teacherFileInfo = document.getElementById('teacher-file-info');
const teacherSelectedFilename = document.getElementById('teacher-selected-filename');
const collapsedTeacherFilename = document.getElementById('collapsed-teacher-filename');
const teacherChangeFileBtn = document.getElementById('teacher-change-file-btn');
const teacherFileUploadArea = document.querySelector('.teacher-upload-area');

// 评价内容区域DOM元素
const commentsListElement = document.getElementById('comments-list');
const commentsScoreFilterElement = document.getElementById('comments-score-filter');
const commentsLabelFilterElement = document.getElementById('comments-label-filter');
const commentsFilterBtn = document.getElementById('comments-filter-btn');
const commentsPrevPageBtn = document.getElementById('comments-prev-page');
const commentsNextPageBtn = document.getElementById('comments-next-page');
const commentsPageInfoElement = document.getElementById('comments-page-info');

// 学员评价内容筛选控件DOM元素
const commentsTeacherNameFilter = document.getElementById('comments-teacher-name-filter');
const commentsProductLineSearch = document.getElementById('comments-product-line-search');
const commentsClearProductLineBtn = document.getElementById('comments-clear-product-line');
const commentsGradeFilter = document.getElementById('comments-grade-filter');
const commentsSubjectFilter = document.getElementById('comments-subject-filter');
const commentsSessionSearch = document.getElementById('comments-session-search');
const commentsClearSessionBtn = document.getElementById('comments-clear-session');
const commentsExportBtn = document.getElementById('comments-export-btn');

// 主讲老师分析控件DOM元素
const teacherNameFilter = document.getElementById('teacher-name-filter');
const teacherProductLineSearch = document.getElementById('teacher-product-line-search');
const clearProductLineBtn = document.getElementById('clear-product-line');
const teacherGradeFilter = document.getElementById('teacher-grade-filter');
const teacherSubjectFilter = document.getElementById('teacher-subject-filter');
const teacherSessionSearch = document.getElementById('teacher-session-search');
const clearSessionBtn = document.getElementById('clear-session');
const teacherSortField = document.getElementById('teacher-sort-field');
const teacherSortOrder = document.getElementById('teacher-sort-order');
const teacherApplyFilter = document.getElementById('teacher-apply-filter');
const teacherResetFilters = document.getElementById('teacher-reset-filters');

// 评价内容分页
let commentsCurrentPage = 1;
let filteredComments = [];
const commentsResetFilters = document.getElementById('comments-reset-filters');

// 图表实例
let scoreChart;
let labelChart;
let timeChart;
let deviceChart;
let versionChart;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
});

// 更新清除按钮的显示状态
function updateClearButtonVisibility(inputElement, clearButton) {
    if (!inputElement || !clearButton) return;
    
    const hasValue = inputElement.value.trim().length > 0;
    if (hasValue) {
        clearButton.style.display = 'flex';
    } else {
        clearButton.style.display = 'none';
    }
}

// 初始化事件监听器
function initEventListeners() {
    // 文件上传相关
    if (uploadBtn) uploadBtn.addEventListener('click', handleFileUpload);
    if (fileUpload) fileUpload.addEventListener('change', handleFileChange);
    if (teacherFileUpload) teacherFileUpload.addEventListener('change', handleTeacherFileChange);
    
    // 文件拖拽功能
    if (fileUploadArea) {
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('file-dragover');
        });
        
        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('file-dragover');
        });
        
        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('file-dragover');
            if (e.dataTransfer.files.length) {
                fileUpload.files = e.dataTransfer.files;
                handleFileChange();
            }
        });
    }
    
    // 主讲老师文件拖拽功能
    if (teacherFileUploadArea) {
        teacherFileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            teacherFileUploadArea.classList.add('file-dragover');
        });
        
        teacherFileUploadArea.addEventListener('dragleave', () => {
            teacherFileUploadArea.classList.remove('file-dragover');
        });
        
        teacherFileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            teacherFileUploadArea.classList.remove('file-dragover');
            if (e.dataTransfer.files.length) {
                teacherFileUpload.files = e.dataTransfer.files;
                handleTeacherFileChange();
            }
        });
    }
    
    // 更换文件按钮
    if (changeFileBtn) {
        changeFileBtn.addEventListener('click', () => {
            fileUpload.click();
        });
    }
    
    if (teacherChangeFileBtn) {
        teacherChangeFileBtn.addEventListener('click', () => {
            teacherFileUpload.click();
        });
    }
    
    // 上传区域收起/展开
    if (minimizeBtn) minimizeBtn.addEventListener('click', collapseUploadSection);
    if (expandBtn) expandBtn.addEventListener('click', expandUploadSection);
    if (reuploadBtn) reuploadBtn.addEventListener('click', expandUploadSection);
    
    // 详细数据筛选
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            applyFilters();
            currentPage = 1;
            displayDetailedData();
        });
    }
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayDetailedData();
            }
        });
    }
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredData.length / rowsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                displayDetailedData();
            }
        });
    }
    
    // 评分和标签联动 - 详细数据
    if (scoreFilterElement) {
        scoreFilterElement.addEventListener('change', () => {
            updateLabelFilterByScore(scoreFilterElement.value, labelFilterElement);
        });
    }
    
    // 评价内容筛选
    if (commentsFilterBtn) {
        commentsFilterBtn.addEventListener('click', () => {
            applyCommentsFilters();
            commentsCurrentPage = 1;
            displayComments();
        });
    }
    if (commentsPrevPageBtn) {
        commentsPrevPageBtn.addEventListener('click', () => {
            if (commentsCurrentPage > 1) {
                commentsCurrentPage--;
                displayComments();
            }
        });
    }
    if (commentsNextPageBtn) {
        commentsNextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredComments.length / rowsPerPage);
            if (commentsCurrentPage < totalPages) {
                commentsCurrentPage++;
                displayComments();
            }
        });
    }
    
    // 评分和标签联动 - 评价内容
    if (commentsScoreFilterElement) {
        commentsScoreFilterElement.addEventListener('change', () => {
            updateLabelFilterByScore(commentsScoreFilterElement.value, commentsLabelFilterElement);
            applyCommentsFilters();
            commentsCurrentPage = 1;
            displayComments();
        });
    }
    
    // 标签筛选 - 评价内容
    if (commentsLabelFilterElement) {
        commentsLabelFilterElement.addEventListener('change', () => {
            applyCommentsFilters();
            commentsCurrentPage = 1;
            displayComments();
        });
    }
    
    // 主讲老师分析控件 - 自动筛选
    if (teacherNameFilter) {
        teacherNameFilter.addEventListener('change', applyTeacherFilters);
    }
    
    if (teacherGradeFilter) {
        teacherGradeFilter.addEventListener('change', applyTeacherFilters);
    }
    
    if (teacherSubjectFilter) {
        teacherSubjectFilter.addEventListener('change', applyTeacherFilters);
    }
    
    if (teacherSortField) {
        teacherSortField.addEventListener('change', applyTeacherFilters);
    }
    
    if (teacherSortOrder) {
        teacherSortOrder.addEventListener('change', applyTeacherFilters);
    }
    
    // 保留应用筛选按钮（可选使用）
    if (teacherApplyFilter) {
        teacherApplyFilter.addEventListener('click', applyTeacherFilters);
    }
    
    // 产品线搜索功能 - 实时筛选和清除按钮显示控制
    if (teacherProductLineSearch) {
        teacherProductLineSearch.addEventListener('input', () => {
            updateClearButtonVisibility(teacherProductLineSearch, clearProductLineBtn);
            applyTeacherFilters();
        });
        
        // 初始化清除按钮显示状态
        updateClearButtonVisibility(teacherProductLineSearch, clearProductLineBtn);
    }
    
    // 清空产品线搜索
    if (clearProductLineBtn) {
        clearProductLineBtn.addEventListener('click', () => {
            teacherProductLineSearch.value = '';
            updateClearButtonVisibility(teacherProductLineSearch, clearProductLineBtn);
            applyTeacherFilters();
        });
    }
    
    // 场次ID搜索功能 - 实时筛选和清除按钮显示控制
    if (teacherSessionSearch) {
        teacherSessionSearch.addEventListener('input', () => {
            updateClearButtonVisibility(teacherSessionSearch, clearSessionBtn);
            applyTeacherFilters();
        });
        
        // 初始化清除按钮显示状态
        updateClearButtonVisibility(teacherSessionSearch, clearSessionBtn);
    }
    
    // 清空场次ID搜索
    if (clearSessionBtn) {
        clearSessionBtn.addEventListener('click', () => {
            teacherSessionSearch.value = '';
            updateClearButtonVisibility(teacherSessionSearch, clearSessionBtn);
            applyTeacherFilters();
        });
    }
    
    // 学员评价内容模块的筛选控件事件监听器
    if (commentsTeacherNameFilter) {
        commentsTeacherNameFilter.addEventListener('change', () => {
            applyCommentsFilters();
            commentsCurrentPage = 1;
            displayComments();
        });
    }
    
    if (commentsGradeFilter) {
        commentsGradeFilter.addEventListener('change', () => {
            applyCommentsFilters();
            commentsCurrentPage = 1;
            displayComments();
        });
    }
    
    if (commentsSubjectFilter) {
        commentsSubjectFilter.addEventListener('change', () => {
            applyCommentsFilters();
            commentsCurrentPage = 1;
            displayComments();
        });
    }
    
    // 学员评价内容产品线搜索功能
    if (commentsProductLineSearch) {
        commentsProductLineSearch.addEventListener('input', () => {
            updateClearButtonVisibility(commentsProductLineSearch, commentsClearProductLineBtn);
            applyCommentsFilters();
            commentsCurrentPage = 1;
            displayComments();
        });
        
        // 初始化清除按钮显示状态
        updateClearButtonVisibility(commentsProductLineSearch, commentsClearProductLineBtn);
    }
    
    // 清空学员评价内容产品线搜索
    if (commentsClearProductLineBtn) {
        commentsClearProductLineBtn.addEventListener('click', () => {
            commentsProductLineSearch.value = '';
            updateClearButtonVisibility(commentsProductLineSearch, commentsClearProductLineBtn);
            applyCommentsFilters();
            commentsCurrentPage = 1;
            displayComments();
        });
    }
    
    // 学员评价内容场次ID搜索功能
    if (commentsSessionSearch) {
        commentsSessionSearch.addEventListener('input', () => {
            updateClearButtonVisibility(commentsSessionSearch, commentsClearSessionBtn);
            applyCommentsFilters();
            commentsCurrentPage = 1;
            displayComments();
        });
        
        // 初始化清除按钮显示状态
        updateClearButtonVisibility(commentsSessionSearch, commentsClearSessionBtn);
    }
    
    // 清空学员评价内容场次ID搜索
    if (commentsClearSessionBtn) {
        commentsClearSessionBtn.addEventListener('click', () => {
            commentsSessionSearch.value = '';
            updateClearButtonVisibility(commentsSessionSearch, commentsClearSessionBtn);
            applyCommentsFilters();
            commentsCurrentPage = 1;
            displayComments();
        });
    }
    
    // 学员评价内容导出功能
    if (commentsExportBtn) {
        commentsExportBtn.addEventListener('click', exportCommentsToExcel);
    }
    
    // 主讲老师分析重置筛选按钮
    if (teacherResetFilters) {
        teacherResetFilters.addEventListener('click', resetTeacherFilters);
    }
    
    // 学生评价内容重置筛选按钮
    if (commentsResetFilters) {
        commentsResetFilters.addEventListener('click', resetCommentsFilters);
    }
}

// 处理文件选择变化
function handleFileChange() {
    const file = fileUpload.files[0];
    if (file) {
        // 显示文件信息
        fileInfo.classList.remove('hidden');
        selectedFilename.textContent = file.name;
        
        // 隐藏上传区文字提示
        fileUploadArea.style.padding = '15px';
        const uploadText = fileUploadArea.querySelector('.upload-text');
        const uploadIcon = fileUploadArea.querySelector('.upload-icon');
        if (uploadText) uploadText.style.display = 'none';
        if (uploadIcon) uploadIcon.style.display = 'none';
        
        updateUploadButtonState();
    }
}

// 处理主讲老师文件选择变化
function handleTeacherFileChange() {
    const file = teacherFileUpload.files[0];
    if (file) {
        // 显示文件信息
        teacherFileInfo.classList.remove('hidden');
        teacherSelectedFilename.textContent = file.name;
        
        // 隐藏上传区文字提示
        teacherFileUploadArea.style.padding = '15px';
        const uploadText = teacherFileUploadArea.querySelector('.upload-text');
        const uploadIcon = teacherFileUploadArea.querySelector('.upload-icon');
        if (uploadText) uploadText.style.display = 'none';
        if (uploadIcon) uploadIcon.style.display = 'none';
        
        updateUploadButtonState();
    }
}

// 更新上传按钮状态
function updateUploadButtonState() {
    const hasEvaluationFile = fileUpload.files.length > 0;
    uploadBtn.disabled = !hasEvaluationFile;
}

// 收起上传区域
function collapseUploadSection() {
    uploadContent.classList.add('hidden');
    uploadCollapsed.classList.remove('hidden');
    minimizeBtn.classList.add('hidden');
    
    // 更新收起状态的文件名
    const file = fileUpload.files[0];
    const teacherFile = teacherFileUpload.files[0];
    if (file) {
        collapsedFilename.textContent = file.name;
    }
    if (teacherFile) {
        collapsedTeacherFilename.textContent = teacherFile.name;
    } else {
        collapsedTeacherFilename.textContent = '未选择主讲老师文件';
    }
}

// 展开上传区域
function expandUploadSection() {
    uploadContent.classList.remove('hidden');
    uploadCollapsed.classList.add('hidden');
    minimizeBtn.classList.remove('hidden');
    
    // 隐藏悬浮按钮（如果已显示）
    floatingBtn.classList.add('hidden');
    
    // 隐藏左侧导航菜单
    toggleSideNavigation(false);
    
    // 确保上传区域可见
    uploadSection.scrollIntoView({ behavior: 'smooth' });
}

// 处理文件上传
async function handleFileUpload() {
    const file = fileUpload.files[0];
    if (!file) {
        alert('请先选择评价数据文件');
        return;
    }

    try {
        loadingElement.classList.remove('hidden');
        uploadBtn.disabled = true;

        // 检查必要的库是否已加载
        if (typeof XLSX === 'undefined') {
            throw new Error('XLSX库未加载，请刷新页面重试');
        }
        if (typeof Papa === 'undefined') {
            throw new Error('PapaParse库未加载，请刷新页面重试');
        }

        // 解析评价数据
        const data = await parseFile(file);
        if (!data || data.length === 0) {
            throw new Error('未能读取到评价数据或数据格式不正确');
        }

        allData = data;
        
        // 处理主讲老师数据（如果有）
        const teacherFile = teacherFileUpload.files[0];
        if (teacherFile) {
            try {
                teacherData = await parseFile(teacherFile);
                teacherMapping = buildTeacherMapping(teacherData);
                console.log('主讲老师数据加载成功:', teacherMapping);
            } catch (error) {
                console.warn('主讲老师数据处理失败:', error.message);
                teacherData = [];
                teacherMapping = {};
            }
        } else {
            teacherData = [];
            teacherMapping = {};
        }
        
        // 先显示容器，再处理数据
        dashboardElement.classList.remove('hidden');
        commentsSection.classList.remove('hidden');
        detailedDataElement.classList.remove('hidden');
        
        // 如果有主讲老师数据，显示主讲老师分析模块
        if (Object.keys(teacherMapping).length > 0) {
            teacherAnalysisElement.classList.remove('hidden');
        }
        
        // 等待DOM更新完成后处理数据
        setTimeout(() => {
            processData(data);
            
            // 如果有主讲老师数据，生成主讲老师分析
            if (Object.keys(teacherMapping).length > 0) {
                generateTeacherAnalysis(data);
            }
            
            // 初始筛选
            filteredData = [...allData];
            displayDetailedData();
            
            // 初始化评价内容筛选
            filteredComments = extractValidComments(data);
            displayComments();
            
            // 强制重新调整图表大小
            resizeAllCharts();
            
            // 收起上传区域
            collapseUploadSection();
            
            // 显示悬浮按钮
            floatingBtn.classList.remove('hidden');
            
            // 只有在数据成功处理后才显示左侧导航菜单
            if (allData && allData.length > 0) {
                toggleSideNavigation(true);
                // 初始化导航功能
                initSideNavigation();
            }
        }, 300);
        
    } catch (error) {
        alert(`处理文件时出错: ${error.message}`);
        console.error('文件处理错误:', error);
        // 确保在出错时隐藏导航菜单
        toggleSideNavigation(false);
    } finally {
        loadingElement.classList.add('hidden');
        uploadBtn.disabled = false;
    }
}

// 解析文件内容
async function parseFile(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        
        fileReader.onload = (event) => {
            try {
                const fileData = event.target.result;
                const fileExtension = file.name.split('.').pop().toLowerCase();
                
                if (fileExtension === 'csv') {
                    // 检测是否为乱码，如果是则尝试重新读取
                    if (fileData.includes('����') || fileData.includes('��')) {
                        console.log('检测到可能的编码问题，尝试重新以GBK编码读取...');
                        // 重新以GBK编码读取
                        const gbkReader = new FileReader();
                        gbkReader.onload = (gbkEvent) => {
                            try {
                                const gbkData = gbkEvent.target.result;
                                Papa.parse(gbkData, {
                                    header: true,
                                    complete: results => {
                                        const data = results.data.filter(row => Object.keys(row).length > 1);
                                        if (data.length > 0) {
                                            console.log('GBK CSV数据字段:', Object.keys(data[0]));
                                            console.log('GBK CSV样本数据:', data[0]);
                                        }
                                        resolve(data);
                                    },
                                    error: error => {
                                        console.warn('GBK解析失败，使用原始数据:', error);
                                        // 如果GBK也失败，使用原始数据
                                        Papa.parse(fileData, {
                                            header: true,
                                            complete: results => {
                                                const data = results.data.filter(row => Object.keys(row).length > 1);
                                                resolve(data);
                                            },
                                            error: error => reject(error)
                                        });
                                    }
                                });
                            } catch (error) {
                                console.warn('GBK读取失败，使用原始数据:', error);
                                Papa.parse(fileData, {
                                    header: true,
                                    complete: results => {
                                        const data = results.data.filter(row => Object.keys(row).length > 1);
                                        resolve(data);
                                    },
                                    error: error => reject(error)
                                });
                            }
                        };
                        gbkReader.readAsText(file, 'GBK');
                        return;
                    }
                    
                    Papa.parse(fileData, {
                        header: true,
                        complete: results => {
                            const data = results.data.filter(row => Object.keys(row).length > 1);
                            // 打印数据结构，查看字段名
                            if (data.length > 0) {
                                console.log('CSV数据字段:', Object.keys(data[0]));
                                console.log('CSV样本数据:', data[0]);
                            }
                            resolve(data);
                        },
                        error: error => reject(error)
                    });
                } else if (['xlsx', 'xls'].includes(fileExtension)) {
                    const workbook = XLSX.read(fileData, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    // 打印数据结构，查看字段名
                    if (jsonData.length > 0) {
                        console.log('Excel数据字段:', Object.keys(jsonData[0]));
                        console.log('Excel样本数据:', jsonData[0]);
                    }
                    resolve(jsonData);
                } else {
                    reject(new Error('不支持的文件格式'));
                }
            } catch (error) {
                reject(error);
            }
        };
        
        fileReader.onerror = () => reject(new Error('文件读取失败'));
        
        if (['xlsx', 'xls'].includes(file.name.split('.').pop().toLowerCase())) {
            fileReader.readAsBinaryString(file);
        } else {
            fileReader.readAsText(file);
        }
    });
}

// 处理数据并生成图表
function processData(data) {
    // 提取唯一标签并填充筛选下拉列表
    uniqueLabels = extractUniqueLabels(data);
    populateLabelFilter(uniqueLabels);
    
    // 初始化评分和标签下拉框的联动关系
    updateLabelFilterByScore(scoreFilterElement.value, labelFilterElement);
    updateLabelFilterByScore(commentsScoreFilterElement.value, commentsLabelFilterElement);
    
    // 生成基本统计信息
    generateBasicStats(data);
    
    // 销毁旧图表（如果存在）
    destroyCharts();
    
    // 等待DOM完全渲染后初始化图表
    setTimeout(() => {
        // 生成图表
        initCharts();
    }, 200);
    
    // 初始化评价内容区域
    populateCommentsLabelFilter(uniqueLabels);
    
    // 提取和显示有效评价
    filteredComments = extractValidComments(data);
    commentsCurrentPage = 1;
    displayComments();
}

// 销毁所有图表实例
function destroyCharts() {
    if (scoreChart) {
        scoreChart.dispose();
        scoreChart = null;
    }
    if (labelChart) {
        labelChart.dispose();
        labelChart = null;
    }
    if (timeChart) {
        timeChart.dispose();
        timeChart = null;
    }
    if (deviceChart) {
        deviceChart.dispose();
        deviceChart = null;
    }
    if (versionChart) {
        versionChart.dispose();
        versionChart = null;
    }
}

// 提取所有唯一标签
function extractUniqueLabels(data) {
    const labelSet = new Set();
    
    data.forEach(row => {
        if (row.label && row.label !== "[]") {
            const labels = row.label.split(',').map(label => cleanLabel(label));
            
            labels.forEach(label => {
                if (label) labelSet.add(label);
            });
        }
    });
    
    return Array.from(labelSet).sort();
}

// 填充标签筛选下拉列表
function populateLabelFilter(labels) {
    // 清空下拉列表
    labelFilterElement.innerHTML = '<option value="all">全部标签</option>';
    commentsLabelFilterElement.innerHTML = '<option value="all">全部标签</option>';
    
    // 添加每个标签
    labels.forEach(label => {
        const option = document.createElement('option');
        option.value = label;
        option.textContent = label;
        labelFilterElement.appendChild(option.cloneNode(true));
        commentsLabelFilterElement.appendChild(option);
    });
}

// 生成基本统计信息
function generateBasicStats(data) {
    const basicStatsElement = document.getElementById('basic-stats');
    
    // 总评价数
    const totalEvaluations = data.length;
    
    // 平均分
    const totalScore = data.reduce((sum, row) => sum + (parseFloat(row.stu_score) || 0), 0);
    const averageScore = totalScore / totalEvaluations || 0;
    
    // 场次数量（按配置中的字段名去重计数）
    const uniqueSessionIds = new Set();
    
    // 打印第一条数据，以查看所有可用字段
    if (data.length > 0) {
        console.log('数据示例的所有字段:', Object.keys(data[0]));
        console.log('数据示例内容:', data[0]);
    }
    
    // 根据配置的字段优先级尝试获取场次ID
    data.forEach(row => {
        let found = false;
        for (const field of fieldMapping.sessionIdFields) {
            if (row[field]) {
                uniqueSessionIds.add(row[field]);
                found = true;
                break; // 找到一个有效字段后停止循环
            }
        }
        
        // 如果没有找到任何配置的字段，尝试使用第一个数据字段作为标识
        if (!found && data.length > 0) {
            const allFields = Object.keys(row);
            // 避免使用明显不是ID的字段（评分、标签、内容等）
            const excludeFields = ['stu_score', 'label', 'stu_content', 'app_version_number', 'devices', 'created_at'];
            const potentialIdFields = allFields.filter(field => 
                !excludeFields.includes(field) && 
                (field.includes('id') || field.includes('Id') || field.includes('_id'))
            );
            
            if (potentialIdFields.length > 0) {
                const field = potentialIdFields[0]; // 使用第一个可能的ID字段
                if (row[field]) {
                    uniqueSessionIds.add(row[field]);
                    console.log('使用备选字段作为场次ID:', field);
                }
            }
        }
    });
    
    const sessionsCount = uniqueSessionIds.size;
    console.log('找到的唯一场次ID数量:', sessionsCount);
    if (sessionsCount > 0 && sessionsCount < 10) {
        console.log('唯一场次ID列表:', Array.from(uniqueSessionIds));
    }
    
    // 满分评价数
    const perfectScoreCount = data.filter(row => parseFloat(row.stu_score) === 5).length;
    
    // 最常用标签
    const labelCounter = {};
    data.forEach(row => {
        if (row.label && row.label !== "[]") {
            const labels = row.label.split(',').map(label => cleanLabel(label));
            labels.forEach(label => {
                if (label) {
                    labelCounter[label] = (labelCounter[label] || 0) + 1;
                }
            });
        }
    });
    
    let mostUsedLabel = { label: '无', count: 0 };
    Object.entries(labelCounter).forEach(([label, count]) => {
        if (count > mostUsedLabel.count) {
            mostUsedLabel = { label, count };
        }
    });
    
    basicStatsElement.innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${totalEvaluations}</div>
            <div class="stat-label">总评价数</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${sessionsCount}</div>
            <div class="stat-label">场次数量</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${averageScore.toFixed(2)}</div>
            <div class="stat-label">平均分</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${perfectScoreCount}</div>
            <div class="stat-label">满分评价数</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${mostUsedLabel.label}</div>
            <div class="stat-label">最常用标签</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${mostUsedLabel.count}</div>
            <div class="stat-label">最常用标签出现次数</div>
        </div>
    `;
}

// 初始化图表
function initCharts() {
    // 在渲染前先确保DOM已完全加载
    setTimeout(() => {
        // 评分分布图表
        if (document.getElementById('score-chart')) {
            scoreChart = echarts.init(document.getElementById('score-chart'));
        }
        
        // 标签分析图表
        if (document.getElementById('label-chart')) {
            labelChart = echarts.init(document.getElementById('label-chart'));
        }
        
        // 评分趋势图表
        if (document.getElementById('time-chart')) {
            timeChart = echarts.init(document.getElementById('time-chart'));
        }
        
        // 设备分布图表
        if (document.getElementById('device-chart')) {
            deviceChart = echarts.init(document.getElementById('device-chart'));
        }
        
        // 版本分布图表
        if (document.getElementById('version-chart')) {
            versionChart = echarts.init(document.getElementById('version-chart'));
        }
        
        // 窗口大小变化时重绘图表
        window.addEventListener('resize', resizeAllCharts);
        
        // 更新图表
        updateCharts(allData);
    }, 100);
}

// 图表重绘函数
function resizeAllCharts() {
    if (scoreChart) scoreChart.resize();
    if (labelChart) labelChart.resize();
    if (timeChart) timeChart.resize();
    if (deviceChart) deviceChart.resize();
    if (versionChart) versionChart.resize();
}

// 更新所有图表
function updateCharts(data) {
    updateScoreChart(data);
    updateLabelChart(data);
    updateTimeChart(data);
    updateDeviceChart(data);
    updateVersionChart(data);
}

// 更新评分分布图表
function updateScoreChart(data) {
    const scoreData = [0, 0, 0, 0, 0]; // 对应 1-5 分
    
    data.forEach(row => {
        const score = parseFloat(row.stu_score);
        if (score >= 1 && score <= 5) {
            scoreData[Math.floor(score) - 1]++;
        }
    });
    
    const option = {
        title: {
            show: false  // 不显示ECharts的标题，使用HTML的h3标题
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}人 ({d}%)'
        },
        legend: {
            orient: 'horizontal',
            bottom: '0%',
            data: ['1分', '2分', '3分', '4分', '5分'],
            textStyle: {
                fontSize: 12
            }
        },
        color: ['#ff5252', '#ff9800', '#ffc107', '#4caf50', '#2196f3'],
        series: [
            {
                name: '评分分布',
                type: 'pie',
                radius: ['40%', '70%'],  // 设置成环形图
                center: ['50%', '50%'],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 6,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    formatter: '{b}: {c}人\n{d}%',
                    fontSize: 12
                },
                data: [
                    { value: scoreData[0], name: '1分' },
                    { value: scoreData[1], name: '2分' },
                    { value: scoreData[2], name: '3分' },
                    { value: scoreData[3], name: '4分' },
                    { value: scoreData[4], name: '5分' }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    },
                    label: {
                        show: true,
                        fontWeight: 'bold',
                        fontSize: 14
                    }
                }
            }
        ]
    };
    
    scoreChart.setOption(option);
}

// 清理标签，移除特殊字符
function cleanLabel(label) {
    let cleanLabel = label.trim();
    // 移除开头和结尾的引号、方括号
    cleanLabel = cleanLabel.replace(/^["'\[\s]+|["'\]\s]+$/g, '');
    return cleanLabel;
}

// 更新标签分析图表
function updateLabelChart(data) {
    const labelCounter = {};
    
    data.forEach(row => {
        if (row.label && row.label !== "[]") {
            const labels = row.label.split(',').map(label => cleanLabel(label));
            labels.forEach(label => {
                if (label) {
                    labelCounter[label] = (labelCounter[label] || 0) + 1;
                }
            });
        }
    });
    
    // 取前10个最多的标签
    const sortedLabels = Object.entries(labelCounter)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const option = {
        title: {
            show: false  // 不显示ECharts的标题，使用HTML的h3标题
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: '{b}: {c}次'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: sortedLabels.map(item => item[0]),
            axisLabel: {
                interval: 0,
                rotate: 45,
                fontSize: 11,
                margin: 15
            }
        },
        yAxis: {
            type: 'value',
            name: '次数',
            nameTextStyle: {
                fontSize: 12
            }
        },
        series: [
            {
                name: '使用次数',
                type: 'bar',
                data: sortedLabels.map(item => item[1]),
                barWidth: '50%',
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#83bff6' },
                        { offset: 0.5, color: '#188df0' },
                        { offset: 1, color: '#188df0' }
                    ]),
                    borderRadius: [5, 5, 0, 0]
                },
                emphasis: {
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#2378f7' },
                            { offset: 0.7, color: '#2378f7' },
                            { offset: 1, color: '#83bff6' }
                        ])
                    }
                },
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 12
                }
            }
        ]
    };
    
    labelChart.setOption(option);
}

// 更新评分趋势图表
function updateTimeChart(data) {
    // 按照时间排序
    const sortedData = [...data].sort((a, b) => {
        return new Date(a.created_at) - new Date(b.created_at);
    });
    
    // 按天分组数据
    const dailyData = {};
    
    sortedData.forEach(row => {
        if (row.created_at) {
            const date = new Date(row.created_at);
            const dateKey = date.toISOString().split('T')[0];
            
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = {
                    totalScore: 0,
                    count: 0
                };
            }
            
            dailyData[dateKey].totalScore += parseFloat(row.stu_score) || 0;
            dailyData[dateKey].count++;
        }
    });
    
    // 计算每天的平均分
    const dates = [];
    const avgScores = [];
    
    Object.entries(dailyData).forEach(([date, data]) => {
        dates.push(date);
        avgScores.push((data.totalScore / data.count).toFixed(2));
    });
    
    const option = {
        title: {
            show: false  // 不显示ECharts的标题，使用HTML的h3标题
        },
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br/>{a}: {c}分'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                interval: Math.floor(dates.length / 10),
                rotate: 45,
                fontSize: 11,
                margin: 15
            },
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            min: 1,
            max: 5,
            name: '平均分',
            nameTextStyle: {
                fontSize: 12
            },
            splitNumber: 4
        },
        series: [
            {
                name: '平均评分',
                type: 'line',
                data: avgScores,
                smooth: true,
                symbolSize: 8,
                lineStyle: {
                    width: 3,
                    color: '#5470c6'
                },
                itemStyle: {
                    color: '#5470c6'
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(84, 112, 198, 0.5)' },
                        { offset: 1, color: 'rgba(84, 112, 198, 0.1)' }
                    ])
                },
                markLine: {
                    data: [
                        { 
                            type: 'average', 
                            name: '平均值',
                            lineStyle: {
                                color: '#ff7f50',
                                type: 'dashed',
                                width: 2
                            },
                            label: {
                                position: 'end',
                                fontSize: 12,
                                formatter: '平均: {c}分'
                            }
                        }
                    ]
                }
            }
        ]
    };
    
    timeChart.setOption(option);
}

// 更新设备分布图表
function updateDeviceChart(data) {
    const deviceCounter = {};
    
    data.forEach(row => {
        if (row.devices) {
            // 获取设备品牌
            const deviceBrand = getDeviceBrand(row.devices);
            
            // 累计品牌数量
            deviceCounter[deviceBrand] = (deviceCounter[deviceBrand] || 0) + 1;
        }
    });
    
    // 取前8个最多的设备品牌
    const sortedDevices = Object.entries(deviceCounter)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
    
    const option = {
        title: {
            show: false  // 不显示ECharts的标题，使用HTML的h3标题
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}人 ({d}%)'
        },
        legend: {
            orient: 'horizontal',
            bottom: '0%',
            itemWidth: 14,
            itemHeight: 10,
            textStyle: {
                fontSize: 11
            }
        },
        color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'],
        series: [
            {
                name: '设备分布',
                type: 'pie',
                radius: ['30%', '65%'],
                center: ['50%', '45%'],
                roseType: 'radius',
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 6,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    formatter: '{b}: {c}人',
                    fontSize: 11
                },
                data: sortedDevices.map(item => ({
                    name: item[0],
                    value: item[1]
                })),
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    },
                    label: {
                        show: true,
                        fontWeight: 'bold',
                        fontSize: 12
                    }
                }
            }
        ]
    };
    
    deviceChart.setOption(option);
}

// 更新版本分布图表
function updateVersionChart(data) {
    const versionCounter = {};
    
    data.forEach(row => {
        if (row.app_version_number) {
            versionCounter[row.app_version_number] = (versionCounter[row.app_version_number] || 0) + 1;
        }
    });
    
    // 按版本号排序
    const sortedVersions = Object.entries(versionCounter)
        .sort((a, b) => {
            const versionA = a[0].split('.').map(Number);
            const versionB = b[0].split('.').map(Number);
            
            for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
                const numA = versionA[i] || 0;
                const numB = versionB[i] || 0;
                
                if (numA !== numB) {
                    return numA - numB;
                }
            }
            
            return 0;
        });
    
    const option = {
        title: {
            show: false  // 不显示ECharts的标题，使用HTML的h3标题
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: '{b}<br/>{a}: {c}人'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: sortedVersions.map(item => item[0]),
            axisLabel: {
                interval: 0,
                rotate: 45,
                fontSize: 11,
                margin: 15
            }
        },
        yAxis: {
            type: 'value',
            name: '人数',
            nameTextStyle: {
                fontSize: 12
            }
        },
        series: [
            {
                name: '使用人数',
                type: 'bar',
                barWidth: '60%',
                data: sortedVersions.map(item => item[1]),
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 12
                },
                itemStyle: {
                    color: function(params) {
                        // 为不同版本设置渐变色
                        const colors = [
                            ['#83bff6', '#188df0', '#188df0'],
                            ['#71d0a1', '#0bc286', '#0bc286'],
                            ['#f4a582', '#ef8656', '#ef8656'],
                            ['#b3cde3', '#6497b1', '#6497b1'],
                            ['#fddbc7', '#e46050', '#e46050'],
                            ['#f2f0cb', '#b0a160', '#b0a160']
                        ];
                        const index = params.dataIndex % colors.length;
                        return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: colors[index][0] },
                            { offset: 0.5, color: colors[index][1] },
                            { offset: 1, color: colors[index][2] }
                        ]);
                    },
                    borderRadius: [5, 5, 0, 0]
                }
            }
        ]
    };
    
    versionChart.setOption(option);
}

// 应用筛选条件
function applyFilters() {
    const scoreFilter = scoreFilterElement.value;
    const labelFilter = labelFilterElement.value;
    const contentFilter = contentFilterElement.checked;
    
    filteredData = allData.filter(row => {
        // 评分筛选
        if (scoreFilter !== 'all' && parseFloat(row.stu_score) !== parseFloat(scoreFilter)) {
            return false;
        }
        
        // 标签筛选
        if (labelFilter !== 'all') {
            // 如果标签为空，则不符合条件
            if (!row.label || row.label === "[]") {
                return false;
            }
            
            // 清理标签并检查
            const cleanedLabels = row.label.split(',').map(label => cleanLabel(label));
            if (!cleanedLabels.includes(labelFilter)) {
                return false;
            }
            
            // 检查标签是否与评分匹配
            if (scoreFilter !== 'all') {
                const validLabelsForScore = scoreLabelsMap[scoreFilter] || [];
                if (!validLabelsForScore.includes(labelFilter)) {
                    return false;
                }
            }
        }
        
        // 内容筛选
        if (contentFilter) {
            if (!row.stu_content) {
                return false;
            }
            
            const placeholder = extractPlaceholder(row.stu_content);
            if (!placeholder || placeholder === "有什么话想对你的主讲老师说吗？ 快告诉Ta吧~") {
                return false;
            }
        }
        
        return true;
    });
}

// 显示详细数据表格
function displayDetailedData() {
    // 计算分页
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredData.length);
    
    // 更新页码信息
    pageInfoElement.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
    
    // 启用/禁用分页按钮
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    
    // 清空表格
    tableBodyElement.innerHTML = '';
    
    // 没有数据时显示提示
    if (filteredData.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 9;
        cell.textContent = '没有符合条件的数据';
        cell.style.textAlign = 'center';
        row.appendChild(cell);
        tableBodyElement.appendChild(row);
        return;
    }
    
    // 填充数据
    for (let i = startIndex; i < endIndex; i++) {
        const row = filteredData[i];
        const tableRow = document.createElement('tr');
        
        // 获取设备品牌
        const deviceBrand = row.devices ? getDeviceBrand(row.devices) : '未知';
        const deviceDisplay = row.devices ? `${deviceBrand} (${row.devices})` : '-';
        
        // 为每个列添加数据
        tableRow.innerHTML = `
            <td>${row.evaluation_id || '-'}</td>
            <td>${row.session_id || '-'}</td>
            <td>${row.stu_id || '-'}</td>
            <td>${row.stu_score || '-'}</td>
            <td>${row.label || '-'}</td>
            <td>${row.stu_content || '-'}</td>
            <td>${row.app_version_number || '-'}</td>
            <td>${deviceDisplay}</td>
            <td>${row.created_at || '-'}</td>
        `;
        
        tableBodyElement.appendChild(tableRow);
    }
}

// 从JSON中提取placeholder字段
function extractPlaceholder(jsonString) {
    try {
        // 尝试解析JSON字符串
        const data = JSON.parse(jsonString);
        
        // 检查是否有detailList数组
        if (data && data.detailList && Array.isArray(data.detailList)) {
            // 遍历detailList查找placeholder字段
            for (const detail of data.detailList) {
                if (detail.placeholder) {
                    return detail.placeholder;
                }
            }
        }
        
        // 如果没有找到placeholder，返回空字符串
        return '';
    } catch (error) {
        console.error('解析JSON失败:', error);
        return '';
    }
}

// 提取有效评价内容（含有有效placeholder值的记录）
function extractValidComments(data) {
    return data.filter(row => {
        if (!row.stu_content) return false;
        
        // 解析JSON并提取placeholder
        const placeholder = extractPlaceholder(row.stu_content);
        
        // 检查placeholder是否存在且不是默认值
        return placeholder && 
               placeholder !== "有什么话想对你的主讲老师说吗？ 快告诉Ta吧~";
    });
}

// 填充评价内容区域的标签筛选下拉列表
function populateCommentsLabelFilter(labels) {
    commentsLabelFilterElement.innerHTML = '<option value="all">全部标签</option>';
    
    labels.forEach(label => {
        const option = document.createElement('option');
        option.value = label;
        option.textContent = label;
        commentsLabelFilterElement.appendChild(option);
    });
}

// 填充学员评价内容模块的筛选控件
function populateCommentsFilters(teacherNames, teacherStats) {
    // 填充主讲姓名筛选下拉框
    if (commentsTeacherNameFilter) {
        commentsTeacherNameFilter.innerHTML = '<option value="all">全部主讲老师</option>';
        teacherNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            commentsTeacherNameFilter.appendChild(option);
        });
    }
    
    // 收集所有唯一的产品线、年级、学科
    const productLines = new Set();
    const grades = new Set();
    const subjects = new Set();
    
    Object.values(teacherStats).forEach(stats => {
        if (stats.productLine) productLines.add(stats.productLine);
        if (stats.grade) grades.add(stats.grade);
        if (stats.subject) subjects.add(stats.subject);
    });
    
    // 填充年级筛选下拉框
    if (commentsGradeFilter) {
        commentsGradeFilter.innerHTML = '<option value="all">全部年级</option>';
        Array.from(grades).sort().forEach(grade => {
            const option = document.createElement('option');
            option.value = grade;
            option.textContent = grade;
            commentsGradeFilter.appendChild(option);
        });
    }
    
    // 填充学科筛选下拉框
    if (commentsSubjectFilter) {
        commentsSubjectFilter.innerHTML = '<option value="all">全部学科</option>';
        Array.from(subjects).sort().forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            commentsSubjectFilter.appendChild(option);
        });
    }
    
    // 初始化清除按钮的显示状态
    if (commentsProductLineSearch && commentsClearProductLineBtn) {
        updateClearButtonVisibility(commentsProductLineSearch, commentsClearProductLineBtn);
    }
    if (commentsSessionSearch && commentsClearSessionBtn) {
        updateClearButtonVisibility(commentsSessionSearch, commentsClearSessionBtn);
    }
}

// 应用评价内容筛选条件
function applyCommentsFilters() {
    const scoreFilter = commentsScoreFilterElement.value;
    const labelFilter = commentsLabelFilterElement.value;
    
    // 新增的筛选条件
    const teacherNameFilter = commentsTeacherNameFilter ? commentsTeacherNameFilter.value : 'all';
    const productLineSearchText = commentsProductLineSearch ? commentsProductLineSearch.value.toLowerCase().trim() : '';
    const gradeFilter = commentsGradeFilter ? commentsGradeFilter.value : 'all';
    const subjectFilter = commentsSubjectFilter ? commentsSubjectFilter.value : 'all';
    const sessionSearchText = commentsSessionSearch ? commentsSessionSearch.value.toLowerCase().trim() : '';
    
    filteredComments = allData.filter(row => {
        // 必须是有效内容
        if (!row.stu_content) {
            return false;
        }
        
        // 提取placeholder并检查有效性
        const placeholder = extractPlaceholder(row.stu_content);
        if (!placeholder || placeholder === "有什么话想对你的主讲老师说吗？ 快告诉Ta吧~") {
            return false;
        }
        
        // 评分筛选
        if (scoreFilter !== 'all' && parseFloat(row.stu_score) !== parseFloat(scoreFilter)) {
            return false;
        }
        
        // 标签筛选
        if (labelFilter !== 'all') {
            if (!row.label || row.label === "[]") {
                return false;
            }
            
            const cleanedLabels = row.label.split(',').map(label => cleanLabel(label));
            if (!cleanedLabels.includes(labelFilter)) {
                return false;
            }
            
            // 检查标签是否与评分匹配
            if (scoreFilter !== 'all') {
                const validLabelsForScore = scoreLabelsMap[scoreFilter] || [];
                if (!validLabelsForScore.includes(labelFilter)) {
                    return false;
                }
            }
        }
        
        // 获取场次ID（支持多种字段名）
        let sessionId = null;
        for (const field of fieldMapping.sessionIdFields) {
            if (row[field]) {
                sessionId = String(row[field]);
                break;
            }
        }
        
        // 主讲老师筛选
        if (teacherNameFilter !== 'all' && sessionId) {
            const teacherInfo = teacherMapping[sessionId];
            if (!teacherInfo) {
                return false;
            }
            const teacherName = extractTeacherName(teacherInfo);
            if (teacherName !== teacherNameFilter) {
                return false;
            }
        }
        
        // 产品线筛选
        if (productLineSearchText && sessionId) {
            const teacherInfo = teacherMapping[sessionId];
            if (!teacherInfo) {
                return false;
            }
            const fullInfo = extractTeacherFullInfo(teacherInfo);
            if (!fullInfo.productLine || !fullInfo.productLine.toLowerCase().includes(productLineSearchText)) {
                return false;
            }
        }
        
        // 年级筛选
        if (gradeFilter !== 'all' && sessionId) {
            const teacherInfo = teacherMapping[sessionId];
            if (!teacherInfo) {
                return false;
            }
            const fullInfo = extractTeacherFullInfo(teacherInfo);
            if (fullInfo.grade !== gradeFilter) {
                return false;
            }
        }
        
        // 学科筛选
        if (subjectFilter !== 'all' && sessionId) {
            const teacherInfo = teacherMapping[sessionId];
            if (!teacherInfo) {
                return false;
            }
            const fullInfo = extractTeacherFullInfo(teacherInfo);
            if (fullInfo.subject !== subjectFilter) {
                return false;
            }
        }
        
        // 场次ID搜索筛选
        if (sessionSearchText && sessionId) {
            if (!sessionId.toLowerCase().includes(sessionSearchText)) {
                return false;
            }
        }
        
        return true;
    });
}

// 获取评分对应的颜色和文本
function getScoreColor(score) {
    const scoreNum = parseFloat(score);
    if (scoreNum === 5) return { color: '#2196f3', text: '非常满意' };
    if (scoreNum >= 4) return { color: '#4caf50', text: '满意' };
    if (scoreNum >= 3) return { color: '#ff9800', text: '一般' };
    if (scoreNum >= 2) return { color: '#ff5722', text: '不满意' };
    return { color: '#f44336', text: '非常不满意' };
}

// 显示评价内容
function displayComments() {
    // 计算分页
    const totalPages = Math.ceil(filteredComments.length / rowsPerPage);
    const startIndex = (commentsCurrentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredComments.length);
    
    // 更新页码信息
    commentsPageInfoElement.textContent = `第 ${commentsCurrentPage} 页 / 共 ${totalPages} 页`;
    
    // 启用/禁用分页按钮
    commentsPrevPageBtn.disabled = commentsCurrentPage === 1;
    commentsNextPageBtn.disabled = commentsCurrentPage === totalPages;
    
    // 清空评价列表
    commentsListElement.innerHTML = '';
    
    // 没有数据时显示提示
    if (filteredComments.length === 0) {
        commentsListElement.innerHTML = '<div class="no-data">没有找到符合条件的评价内容</div>';
        return;
    }
    
    // 填充数据
    for (let i = startIndex; i < endIndex; i++) {
        const comment = filteredComments[i];
        const scoreInfo = getScoreColor(comment.stu_score);
        
        // 获取场次ID（支持多种字段名）
        let sessionId = '';
        for (const field of fieldMapping.sessionIdFields) {
            if (comment[field]) {
                sessionId = String(comment[field]);
                break;
            }
        }
        
        // 获取主讲老师信息
        let teacherName = '未知';
        let grade = '';
        let subject = '';
        let productLine = '';
        
        if (sessionId && teacherMapping[sessionId]) {
            const teacherInfo = teacherMapping[sessionId];
            const fullInfo = extractTeacherFullInfo(teacherInfo);
            teacherName = fullInfo.name;
            grade = fullInfo.grade;
            subject = fullInfo.subject;
            productLine = fullInfo.productLine;
        }
        
        // 获取设备品牌
        const deviceBrand = comment.devices ? getDeviceBrand(comment.devices) : '未知';
        const deviceInfo = comment.devices ? `${deviceBrand} (${comment.devices})` : '-';
        
        // 从JSON中提取placeholder
        const placeholder = extractPlaceholder(comment.stu_content);
        
        // 创建评价卡片
        const commentCard = document.createElement('div');
        commentCard.className = 'comment-card';
        commentCard.style.borderLeftColor = scoreInfo.color;
        
        // 生成标签HTML
        const tagsHtml = `
            <div class="comment-tags">
                <span class="comment-tag teacher-tag">${teacherName}</span>
                ${grade ? `<span class="comment-tag grade-tag">${grade}</span>` : ''}
                ${subject ? `<span class="comment-tag subject-tag">${subject}</span>` : ''}
                ${productLine ? `<span class="comment-tag product-tag">${productLine}</span>` : ''}
            </div>
        `;
        
        // 设置评价卡片内容
        commentCard.innerHTML = `
            <div class="comment-header">
                <div class="comment-info">
                    <span class="comment-score" style="color: ${scoreInfo.color};">${comment.stu_score}分 (${scoreInfo.text})</span>
                    <span>评价ID: ${comment.evaluation_id || '-'}</span>
                    <span>学生ID: ${comment.stu_id || '-'}</span>
                    <span>场次ID: ${sessionId || '-'}</span>
                </div>
                ${tagsHtml}
            </div>
            <div class="comment-content">${placeholder}</div>
            <div class="comment-meta">
                <span>评价时间: ${comment.created_at ? new Date(comment.created_at).toLocaleString() : '-'}</span>
                <span>设备: ${deviceInfo} | 版本: ${comment.app_version_number || '-'}</span>
            </div>
        `;
        
        commentsListElement.appendChild(commentCard);
    }
}

// 根据评分更新标签筛选下拉框
function updateLabelFilterByScore(score, labelFilterElement) {
    // 保存当前选中的值
    const currentValue = labelFilterElement.value;
    
    // 清空下拉框
    labelFilterElement.innerHTML = '<option value="all">全部标签</option>';
    
    if (score === 'all') {
        // 如果选择"全部"，则显示所有标签
        uniqueLabels.forEach(label => {
            const option = document.createElement('option');
            option.value = label;
            option.textContent = label;
            labelFilterElement.appendChild(option);
        });
    } else {
        // 根据评分获取对应的标签
        const scoreLabels = scoreLabelsMap[score] || [];
        
        // 添加对应评分的标签选项
        scoreLabels.forEach(label => {
            // 检查该标签是否在该数据集中实际存在
            if (uniqueLabels.includes(label)) {
                const option = document.createElement('option');
                option.value = label;
                option.textContent = label;
                labelFilterElement.appendChild(option);
            } else {
                console.log(`标签 "${label}" 在当前数据集中不存在`);
            }
        });
    }
    
    // 尝试恢复原来选中的值（如果在新选项中存在）
    if (currentValue !== 'all') {
        const exists = Array.from(labelFilterElement.options).some(option => option.value === currentValue);
        if (exists) {
            labelFilterElement.value = currentValue;
        } else {
            labelFilterElement.value = 'all';
        }
    }
}

// 根据设备型号获取品牌
function getDeviceBrand(deviceModel) {
    if (!deviceModel) return '未知';
    
    // 尝试匹配设备型号
    for (const item of deviceBrandMap) {
        if (item.pattern.test(deviceModel)) {
            return item.brand;
        }
    }
    
    // 如果没有匹配到任何规则，返回原始型号
    return '其他';
}

// 构建主讲老师映射关系
function buildTeacherMapping(teacherData) {
    const mapping = {};
    const sessionMapping = {};
    
    if (!teacherData || teacherData.length === 0) {
        return mapping;
    }
    
    // 打印主讲老师数据结构
    console.log('主讲老师数据字段:', Object.keys(teacherData[0]));
    console.log('主讲老师数据示例:', teacherData[0]);
    
    // 尝试识别场次ID和主讲老师字段
    const firstRow = teacherData[0];
    const fields = Object.keys(firstRow);
    
    // 查找场次ID字段 - 扩展支持更多可能的字段名
    let sessionIdField = null;
    const sessionIdCandidates = [
        '场次ID', '场次id', '场次Id', 'sessionId', 'session_id', 'session_Id',
        'plan_id', 'planId', 'plan_Id', 'classId', 'class_id', 'class_Id',
        'courseId', 'course_id', 'course_Id', 'ID', 'id', 'Id',
        '课程ID', '课程id', '课程Id', '班级ID', '班级id', '班级Id'
    ];
    
    for (const candidate of sessionIdCandidates) {
        if (fields.includes(candidate)) {
            sessionIdField = candidate;
            console.log(`找到场次ID字段: ${candidate}`);
            break;
        }
    }
    
    // 查找主讲老师字段 - 更新字段名
    let teacherField = null;
    const teacherCandidates = [
        '主讲老师姓名', '主讲老师', '主讲', '老师', '讲师', '主讲姓名', '教师', '授课老师',
        'teacher', 'Teacher', 'instructor', 'Instructor', 'lecturer', 'Lecturer',
        '主讲教师', '任课老师', '任课教师', '课程老师', '课程教师'
    ];
    
    for (const candidate of teacherCandidates) {
        if (fields.includes(candidate)) {
            teacherField = candidate;
            console.log(`找到主讲老师字段: ${candidate}`);
            break;
        }
    }
    
    // 查找时间相关字段 - 支持新的三字段格式
    let sessionDateField = null;
    let sessionStartTimeField = null;
    let sessionEndTimeField = null;
    let sessionTimeField = null; // 兼容旧格式
    
    const sessionDateCandidates = ['真实上课日期', '上课日期', '课程日期', '日期'];
    const sessionStartTimeCandidates = ['真实上课时间', '上课时间', '开始时间', '起始时间'];
    const sessionEndTimeCandidates = ['真实下课时间', '下课时间', '结束时间', '终止时间'];
    const sessionTimeCandidates = [
        '场次时间', '开课时间', '课程时间',
        'session_time', 'class_time', 'course_time', 'start_time', 'time',
        '时间', '日期时间'
    ];
    
    // 查找新格式的三个字段
    for (const candidate of sessionDateCandidates) {
        if (fields.includes(candidate)) {
            sessionDateField = candidate;
            console.log(`找到上课日期字段: ${candidate}`);
            break;
        }
    }
    
    for (const candidate of sessionStartTimeCandidates) {
        if (fields.includes(candidate)) {
            sessionStartTimeField = candidate;
            console.log(`找到上课时间字段: ${candidate}`);
            break;
        }
    }
    
    for (const candidate of sessionEndTimeCandidates) {
        if (fields.includes(candidate)) {
            sessionEndTimeField = candidate;
            console.log(`找到下课时间字段: ${candidate}`);
            break;
        }
    }
    
    // 查找旧格式的单一时间字段（兼容性）
    if (!sessionDateField || !sessionStartTimeField || !sessionEndTimeField) {
        for (const candidate of sessionTimeCandidates) {
            if (fields.includes(candidate)) {
                sessionTimeField = candidate;
                console.log(`找到场次时间字段（兼容格式）: ${candidate}`);
                break;
            }
        }
    }
    
    // 查找产品线、年级、学科字段
    let productLineField = null;
    let gradeField = null;
    let subjectField = null;
    
    const productLineCandidates = ['课程名称', '产品线', '课程产品', '产品', '课程类型'];
    const gradeCandidates = ['课程年级', '年级', '学段', '级别'];
    const subjectCandidates = ['课程学科', '学科', '科目', '课程科目'];
    
    for (const candidate of productLineCandidates) {
        if (fields.includes(candidate)) {
            productLineField = candidate;
            console.log(`找到产品线字段: ${candidate}`);
            break;
        }
    }
    
    for (const candidate of gradeCandidates) {
        if (fields.includes(candidate)) {
            gradeField = candidate;
            console.log(`找到年级字段: ${candidate}`);
            break;
        }
    }
    
    for (const candidate of subjectCandidates) {
        if (fields.includes(candidate)) {
            subjectField = candidate;
            console.log(`找到学科字段: ${candidate}`);
            break;
        }
    }
    
    // 如果没有找到精确匹配，尝试模糊匹配
    if (!sessionIdField) {
        for (const field of fields) {
            if (field.toLowerCase().includes('id') || field.includes('ID') || 
                field.includes('场次') || field.includes('课程') || field.includes('班级')) {
                sessionIdField = field;
                console.log(`模糊匹配到场次ID字段: ${field}`);
                break;
            }
        }
    }
    
    if (!teacherField) {
        for (const field of fields) {
            if (field.includes('老师') || field.includes('教师') || field.includes('讲师') ||
                field.toLowerCase().includes('teacher') || field.toLowerCase().includes('instructor')) {
                teacherField = field;
                console.log(`模糊匹配到主讲老师字段: ${field}`);
                break;
            }
        }
    }
    
    // 模糊匹配时间字段
    if (!sessionDateField && !sessionTimeField) {
        for (const field of fields) {
            if (field.includes('日期') || field.toLowerCase().includes('date')) {
                sessionDateField = field;
                console.log(`模糊匹配到日期字段: ${field}`);
                break;
            }
        }
    }
    
    if (!sessionStartTimeField && !sessionTimeField) {
        for (const field of fields) {
            if ((field.includes('时间') || field.toLowerCase().includes('time')) && 
                (field.includes('上课') || field.includes('开始') || field.includes('起始'))) {
                sessionStartTimeField = field;
                console.log(`模糊匹配到开始时间字段: ${field}`);
                break;
            }
        }
    }
    
    if (!sessionEndTimeField && !sessionTimeField) {
        for (const field of fields) {
            if ((field.includes('时间') || field.toLowerCase().includes('time')) && 
                (field.includes('下课') || field.includes('结束') || field.includes('终止'))) {
                sessionEndTimeField = field;
                console.log(`模糊匹配到结束时间字段: ${field}`);
                break;
            }
        }
    }
    
    if (!sessionTimeField && !sessionDateField) {
        for (const field of fields) {
            if (field.includes('时间') || field.includes('日期') ||
                field.toLowerCase().includes('time') || field.toLowerCase().includes('date')) {
                sessionTimeField = field;
                console.log(`模糊匹配到场次时间字段: ${field}`);
                break;
            }
        }
    }
    
    // 模糊匹配产品线、年级、学科字段
    if (!productLineField) {
        for (const field of fields) {
            if (field.includes('课程') || field.includes('产品') || field.includes('名称')) {
                productLineField = field;
                console.log(`模糊匹配到产品线字段: ${field}`);
                break;
            }
        }
    }
    
    if (!gradeField) {
        for (const field of fields) {
            if (field.includes('年级') || field.includes('学段') || field.includes('级别')) {
                gradeField = field;
                console.log(`模糊匹配到年级字段: ${field}`);
                break;
            }
        }
    }
    
    if (!subjectField) {
        for (const field of fields) {
            if (field.includes('学科') || field.includes('科目')) {
                subjectField = field;
                console.log(`模糊匹配到学科字段: ${field}`);
                break;
            }
        }
    }
    
    if (!sessionIdField || !teacherField) {
        console.warn('未找到合适的场次ID或主讲老师字段');
        console.log('可用字段:', fields);
        console.log('请确保CSV文件包含场次ID和主讲老师信息的列');
        return mapping;
    }
    
    console.log(`使用字段 - 场次ID: ${sessionIdField}, 主讲老师: ${teacherField}`);
    console.log(`时间字段 - 日期: ${sessionDateField || '未找到'}, 开始时间: ${sessionStartTimeField || '未找到'}, 结束时间: ${sessionEndTimeField || '未找到'}, 兼容时间: ${sessionTimeField || '未找到'}`);
    console.log(`扩展字段 - 产品线: ${productLineField || '未找到'}, 年级: ${gradeField || '未找到'}, 学科: ${subjectField || '未找到'}`);
    
    // 构建映射关系
    let mappingCount = 0;
    teacherData.forEach((row, index) => {
        const sessionId = row[sessionIdField];
        const teacherInfo = row[teacherField];
        
        // 构建时间信息
        let sessionTime = '';
        if (sessionDateField && sessionStartTimeField && sessionEndTimeField) {
            // 新格式：合并三个字段
            const date = row[sessionDateField] || '';
            const startTime = row[sessionStartTimeField] || '';
            const endTime = row[sessionEndTimeField] || '';
            if (date && startTime && endTime) {
                sessionTime = `${date} ${startTime}~${endTime}`;
            }
        } else if (sessionTimeField) {
            // 兼容旧格式
            sessionTime = row[sessionTimeField] || '';
        }
        
        // 获取扩展信息
        const productLine = productLineField ? row[productLineField] : '';
        const grade = gradeField ? row[gradeField] : '';
        const subject = subjectField ? row[subjectField] : '';
        
        if (sessionId && teacherInfo) {
            // 清理场次ID（去除可能的空格和特殊字符）
            const cleanSessionId = String(sessionId).trim();
            
            // 构建完整的教师信息对象
            const teacherData = {
                name: teacherInfo,
                productLine: productLine,
                grade: grade,
                subject: subject
            };
            
            mapping[cleanSessionId] = teacherData;
            
            // 构建场次时间映射
            if (sessionTime) {
                sessionMapping[cleanSessionId] = String(sessionTime).trim();
            }
            
            mappingCount++;
            
            // 打印前几条映射关系用于调试
            if (index < 5) {
                console.log(`映射关系 ${index + 1}: ${cleanSessionId} -> ${teacherInfo} [${productLine}|${grade}|${subject}] (${sessionTime || '无时间信息'})`);
            }
        }
    });
    
    console.log(`成功建立 ${mappingCount} 条主讲老师映射关系`);
    
    // 保存场次时间映射到全局变量
    window.teacherSessionMapping = sessionMapping;
    
    return mapping;
}

// 从主讲老师信息中提取姓名
function extractTeacherName(teacherInfo) {
    if (!teacherInfo) return '未知';
    
    // 如果是新的对象格式
    if (typeof teacherInfo === 'object' && teacherInfo.name) {
        const name = teacherInfo.name;
        // 处理格式：小王（123456）
        const match = name.match(/^([^（(]+)/);
        if (match) {
            return match[1].trim();
        }
        return name.trim();
    }
    
    // 兼容旧的字符串格式
    if (typeof teacherInfo === 'string') {
        const match = teacherInfo.match(/^([^（(]+)/);
        if (match) {
            return match[1].trim();
        }
        return teacherInfo.trim();
    }
    
    return '未知';
}

// 从主讲老师信息中提取完整信息
function extractTeacherFullInfo(teacherInfo) {
    if (!teacherInfo) return { name: '未知', productLine: '', grade: '', subject: '' };
    
    // 如果是新的对象格式
    if (typeof teacherInfo === 'object' && teacherInfo.name) {
        return {
            name: extractTeacherName(teacherInfo),
            productLine: teacherInfo.productLine || '',
            grade: teacherInfo.grade || '',
            subject: teacherInfo.subject || ''
        };
    }
    
    // 兼容旧的字符串格式
    return {
        name: extractTeacherName(teacherInfo),
        productLine: '',
        grade: '',
        subject: ''
    };
}

// 生成主讲老师分析
function generateTeacherAnalysis(data) {
    const teacherStatsBody = document.getElementById('teacher-stats-body');
    
    if (!data || data.length === 0 || !teacherMapping || Object.keys(teacherMapping).length === 0) {
        console.log('缺少评价数据或主讲老师映射数据');
        console.log('评价数据条数:', data ? data.length : 0);
        console.log('主讲老师映射条数:', teacherMapping ? Object.keys(teacherMapping).length : 0);
        return;
    }
    
    console.log('开始生成主讲老师分析...');
    console.log('评价数据条数:', data.length);
    console.log('主讲老师映射:', teacherMapping);
    
    // 按主讲老师和场次分组统计
    const teacherStats = {};
    const sessionStats = {}; // 按场次统计
    let matchedCount = 0;
    let unmatchedCount = 0;
    
    data.forEach((row, index) => {
        // 获取场次ID - 优先使用plan_id字段
        let sessionId = row.plan_id || row.session_id || row.classId || row.class_id;
        
        if (sessionId) {
            sessionId = String(sessionId).trim(); // 确保是字符串并去除空格
        }
        
        if (!sessionId || !teacherMapping[sessionId]) {
            unmatchedCount++;
            if (index < 5) { // 只打印前5条未匹配的记录用于调试
                console.log(`未匹配的sessionId: "${sessionId}", 可用的映射keys:`, Object.keys(teacherMapping).slice(0, 5));
            }
            return; // 跳过没有主讲老师信息的数据
        }
        
        matchedCount++;
        
        const teacherInfo = teacherMapping[sessionId];
        const teacherFullInfo = extractTeacherFullInfo(teacherInfo);
        const teacherName = teacherFullInfo.name;
        const score = parseFloat(row.stu_score) || 0;
        const labels = row.label ? row.label.split(',').map(label => cleanLabel(label)) : [];
        
        // 初始化主讲老师统计
        if (!teacherStats[teacherName]) {
            teacherStats[teacherName] = {
                totalCount: 0,
                fiveStarCount: 0,
                oneStarCount: 0,
                sessions: new Set(), // 记录该主讲老师的所有场次
                productLine: teacherFullInfo.productLine,
                grade: teacherFullInfo.grade,
                subject: teacherFullInfo.subject,
                labelCounts: {
                    '讲解很透彻': 0,
                    '非常幽默': 0,
                    '从来不拖堂': 0,
                    '讲解混乱': 0,
                    '有点无聊': 0,
                    '每次都拖堂': 0
                }
            };
        }
        
        // 初始化场次统计
        if (!sessionStats[sessionId]) {
            sessionStats[sessionId] = {
                teacherName: teacherName,
                sessionTime: window.teacherSessionMapping[sessionId] || '',
                totalCount: 0,
                fiveStarCount: 0,
                oneStarCount: 0,
                labelCounts: {
                    '讲解很透彻': 0,
                    '非常幽默': 0,
                    '从来不拖堂': 0,
                    '讲解混乱': 0,
                    '有点无聊': 0,
                    '每次都拖堂': 0
                }
            };
        }
        
        // 更新主讲老师统计
        const teacherStat = teacherStats[teacherName];
        teacherStat.totalCount++;
        teacherStat.sessions.add(sessionId);
        
        if (score === 5) {
            teacherStat.fiveStarCount++;
        } else if (score === 1) {
            teacherStat.oneStarCount++;
        }
        
        // 更新场次统计
        const sessionStat = sessionStats[sessionId];
        sessionStat.totalCount++;
        
        if (score === 5) {
            sessionStat.fiveStarCount++;
        } else if (score === 1) {
            sessionStat.oneStarCount++;
        }
        
        // 统计标签（主讲老师和场次都要统计）
        labels.forEach(label => {
            if (teacherStat.labelCounts.hasOwnProperty(label)) {
                teacherStat.labelCounts[label]++;
            }
            if (sessionStat.labelCounts.hasOwnProperty(label)) {
                sessionStat.labelCounts[label]++;
            }
        });
    });
    
    // 计算平均值
    const teacherNames = Object.keys(teacherStats);
    const averageStats = {
        fiveStarRate: 0,
        oneStarRate: 0,
        labelRates: {
            '讲解很透彻': 0,
            '非常幽默': 0,
            '从来不拖堂': 0,
            '讲解混乱': 0,
            '有点无聊': 0,
            '每次都拖堂': 0
        }
    };
    
    if (teacherNames.length > 0) {
        let totalFiveStarRate = 0;
        let totalOneStarRate = 0;
        const totalLabelRates = {
            '讲解很透彻': 0,
            '非常幽默': 0,
            '从来不拖堂': 0,
            '讲解混乱': 0,
            '有点无聊': 0,
            '每次都拖堂': 0
        };
        
        teacherNames.forEach(name => {
            const stats = teacherStats[name];
            const fiveStarRate = stats.totalCount > 0 ? (stats.fiveStarCount / stats.totalCount * 100) : 0;
            const oneStarRate = stats.totalCount > 0 ? (stats.oneStarCount / stats.totalCount * 100) : 0;
            
            totalFiveStarRate += fiveStarRate;
            totalOneStarRate += oneStarRate;
            
            Object.keys(totalLabelRates).forEach(label => {
                const labelRate = stats.totalCount > 0 ? (stats.labelCounts[label] / stats.totalCount * 100) : 0;
                totalLabelRates[label] += labelRate;
            });
        });
        
        averageStats.fiveStarRate = totalFiveStarRate / teacherNames.length;
        averageStats.oneStarRate = totalOneStarRate / teacherNames.length;
        Object.keys(averageStats.labelRates).forEach(label => {
            averageStats.labelRates[label] = totalLabelRates[label] / teacherNames.length;
        });
    }
    
    // 生成表格HTML
    let html = '';
    
    // 添加各个主讲老师的数据
    teacherNames.forEach(name => {
        const stats = teacherStats[name];
        const fiveStarRate = stats.totalCount > 0 ? (stats.fiveStarCount / stats.totalCount * 100) : 0;
        const oneStarRate = stats.totalCount > 0 ? (stats.oneStarCount / stats.totalCount * 100) : 0;
        
        const labelRates = {};
        Object.keys(stats.labelCounts).forEach(label => {
            labelRates[label] = stats.totalCount > 0 ? (stats.labelCounts[label] / stats.totalCount * 100) : 0;
        });
        
        // 判断是否高于平均值
        const fiveStarAboveAvg = fiveStarRate > averageStats.fiveStarRate;
        const oneStarAboveAvg = oneStarRate > averageStats.oneStarRate;
        
        const labelAboveAvg = {};
        Object.keys(labelRates).forEach(label => {
            labelAboveAvg[label] = labelRates[label] > averageStats.labelRates[label];
        });

        // 获取该主讲老师的所有场次
        const teacherSessions = Array.from(stats.sessions);
        const sessionCount = teacherSessions.length;
        
        // 为每个场次生成一行数据
        teacherSessions.forEach((sessionId, index) => {
            const sessionStat = sessionStats[sessionId];
            const sessionFiveStarRate = sessionStat.totalCount > 0 ? (sessionStat.fiveStarCount / sessionStat.totalCount * 100) : 0;
            const sessionOneStarRate = sessionStat.totalCount > 0 ? (sessionStat.oneStarCount / sessionStat.totalCount * 100) : 0;
            
            const sessionLabelRates = {};
            Object.keys(sessionStat.labelCounts).forEach(label => {
                sessionLabelRates[label] = sessionStat.totalCount > 0 ? (sessionStat.labelCounts[label] / sessionStat.totalCount * 100) : 0;
            });
            
            if (index === 0) {
                // 第一行：显示主讲老师汇总数据 + 第一个场次数据
                html += `
                <tr>
                    <td class="teacher-name-cell" rowspan="${sessionCount}">${name}</td>
                    <td class="product-line-cell" rowspan="${sessionCount}">${stats.productLine || '-'}</td>
                    <td class="grade-cell" rowspan="${sessionCount}">${stats.grade || '-'}</td>
                    <td class="subject-cell" rowspan="${sessionCount}">${stats.subject || '-'}</td>
                    <td class="rate-cell five-star-rate ${fiveStarAboveAvg ? 'above-average-five-star' : ''}" rowspan="${sessionCount}">${fiveStarRate.toFixed(1)}%</td>
                    <td class="rate-cell ${labelAboveAvg['讲解很透彻'] ? 'above-average-five-star' : ''}" rowspan="${sessionCount}">${labelRates['讲解很透彻'].toFixed(1)}%</td>
                    <td class="rate-cell ${labelAboveAvg['非常幽默'] ? 'above-average-five-star' : ''}" rowspan="${sessionCount}">${labelRates['非常幽默'].toFixed(1)}%</td>
                    <td class="rate-cell ${labelAboveAvg['从来不拖堂'] ? 'above-average-five-star' : ''}" rowspan="${sessionCount}">${labelRates['从来不拖堂'].toFixed(1)}%</td>
                    <td class="rate-cell one-star-rate ${oneStarAboveAvg ? 'above-average-one-star' : ''}" rowspan="${sessionCount}">${oneStarRate.toFixed(1)}%</td>
                    <td class="rate-cell ${labelAboveAvg['讲解混乱'] ? 'above-average-one-star' : ''}" rowspan="${sessionCount}">${labelRates['讲解混乱'].toFixed(1)}%</td>
                    <td class="rate-cell ${labelAboveAvg['有点无聊'] ? 'above-average-one-star' : ''}" rowspan="${sessionCount}">${labelRates['有点无聊'].toFixed(1)}%</td>
                    <td class="rate-cell ${labelAboveAvg['每次都拖堂'] ? 'above-average-one-star' : ''}" rowspan="${sessionCount}">${labelRates['每次都拖堂'].toFixed(1)}%</td>
                    <td class="session-cell">${sessionId}</td>
                    <td class="session-time-cell">${sessionStat.sessionTime || '未知'}</td>
                    <td class="rate-cell">${sessionFiveStarRate.toFixed(1)}%</td>
                    <td class="rate-cell">${sessionLabelRates['讲解很透彻'].toFixed(1)}%</td>
                    <td class="rate-cell">${sessionLabelRates['非常幽默'].toFixed(1)}%</td>
                    <td class="rate-cell">${sessionLabelRates['从来不拖堂'].toFixed(1)}%</td>
                    <td class="rate-cell">${sessionOneStarRate.toFixed(1)}%</td>
                    <td class="rate-cell">${sessionLabelRates['讲解混乱'].toFixed(1)}%</td>
                    <td class="rate-cell">${sessionLabelRates['有点无聊'].toFixed(1)}%</td>
                    <td class="rate-cell">${sessionLabelRates['每次都拖堂'].toFixed(1)}%</td>
                </tr>
                `;
            } else {
                // 其他场次行：只显示场次数据
                html += `
                <tr class="session-row">
                    <td class="session-cell">${sessionId}</td>
                    <td class="session-time-cell">${sessionStat.sessionTime || '未知'}</td>
                    <td class="rate-cell">${sessionFiveStarRate.toFixed(1)}%</td>
                    <td class="rate-cell">${sessionLabelRates['讲解很透彻'].toFixed(1)}%</td>
                    <td class="rate-cell">${sessionLabelRates['非常幽默'].toFixed(1)}%</td>
                    <td class="rate-cell">${sessionLabelRates['从来不拖堂'].toFixed(1)}%</td>
                    <td class="rate-cell">${sessionOneStarRate.toFixed(1)}%</td>
                    <td class="rate-cell">${sessionLabelRates['讲解混乱'].toFixed(1)}%</td>
                    <td class="rate-cell">${sessionLabelRates['有点无聊'].toFixed(1)}%</td>
                    <td class="rate-cell">${sessionLabelRates['每次都拖堂'].toFixed(1)}%</td>
                </tr>
                `;
            }
        });
    });
    
    // 添加平均值行
    html += `
        <tr class="average-row">
            <td class="teacher-name-cell">该讲次主讲平均值</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">${averageStats.fiveStarRate.toFixed(1)}%</td>
            <td class="rate-cell">${averageStats.labelRates['讲解很透彻'].toFixed(1)}%</td>
            <td class="rate-cell">${averageStats.labelRates['非常幽默'].toFixed(1)}%</td>
            <td class="rate-cell">${averageStats.labelRates['从来不拖堂'].toFixed(1)}%</td>
            <td class="rate-cell">${averageStats.oneStarRate.toFixed(1)}%</td>
            <td class="rate-cell">${averageStats.labelRates['讲解混乱'].toFixed(1)}%</td>
            <td class="rate-cell">${averageStats.labelRates['有点无聊'].toFixed(1)}%</td>
            <td class="rate-cell">${averageStats.labelRates['每次都拖堂'].toFixed(1)}%</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
        </tr>
    `;
    
    console.log(`数据匹配结果: 匹配 ${matchedCount} 条, 未匹配 ${unmatchedCount} 条`);
    console.log('主讲老师统计结果:', teacherStats);
    
    // 保存统计数据到全局变量
    teacherStatsData = teacherStats;
    teacherAverageStats = averageStats;
    sessionStatsData = sessionStats;
    
    // 填充筛选下拉框
    populateTeacherFilters(teacherNames, teacherStats);
    
    // 同时填充学员评价内容模块的筛选控件
    populateCommentsFilters(teacherNames, teacherStats);
    
    teacherStatsBody.innerHTML = html;
}

// 填充主讲老师筛选下拉框
function populateTeacherFilters(teacherNames, teacherStats) {
    // 填充主讲姓名筛选下拉框
    if (teacherNameFilter) {
        teacherNameFilter.innerHTML = '<option value="all">全部主讲老师</option>';
        teacherNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            teacherNameFilter.appendChild(option);
        });
    }
    
    // 收集所有唯一的产品线、年级、学科
    const productLines = new Set();
    const grades = new Set();
    const subjects = new Set();
    
    Object.values(teacherStats).forEach(stats => {
        if (stats.productLine) productLines.add(stats.productLine);
        if (stats.grade) grades.add(stats.grade);
        if (stats.subject) subjects.add(stats.subject);
    });
    
    // 保存产品线数据用于搜索提示
    window.allProductLines = Array.from(productLines).sort();
    
    // 填充年级筛选下拉框
    if (teacherGradeFilter) {
        teacherGradeFilter.innerHTML = '<option value="all">全部年级</option>';
        Array.from(grades).sort().forEach(grade => {
            const option = document.createElement('option');
            option.value = grade;
            option.textContent = grade;
            teacherGradeFilter.appendChild(option);
        });
    }
    
    // 填充学科筛选下拉框
    if (teacherSubjectFilter) {
        teacherSubjectFilter.innerHTML = '<option value="all">全部学科</option>';
        Array.from(subjects).sort().forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            teacherSubjectFilter.appendChild(option);
        });
    }
    
    // 保存原始产品线列表用于搜索
    window.allProductLines = Array.from(productLines).sort();
    
    // 初始化清除按钮的显示状态
    if (teacherProductLineSearch && clearProductLineBtn) {
        updateClearButtonVisibility(teacherProductLineSearch, clearProductLineBtn);
    }
    if (teacherSessionSearch && clearSessionBtn) {
        updateClearButtonVisibility(teacherSessionSearch, clearSessionBtn);
    }
}



// 应用主讲老师筛选和排序
function applyTeacherFilters() {
    const nameFilter = teacherNameFilter.value;
    const productLineSearchText = teacherProductLineSearch ? teacherProductLineSearch.value.toLowerCase().trim() : '';
    const gradeFilter = teacherGradeFilter ? teacherGradeFilter.value : 'all';
    const subjectFilter = teacherSubjectFilter ? teacherSubjectFilter.value : 'all';
    const sessionSearchText = teacherSessionSearch ? teacherSessionSearch.value.toLowerCase().trim() : '';
    const sortField = teacherSortField.value;
    const sortOrder = teacherSortOrder.value;
    
    // 筛选数据
    let filteredTeachers = Object.keys(teacherStatsData);
    
    if (nameFilter !== 'all') {
        filteredTeachers = filteredTeachers.filter(name => name === nameFilter);
    }
    
    if (productLineSearchText) {
        filteredTeachers = filteredTeachers.filter(name => {
            const stats = teacherStatsData[name];
            return stats.productLine && stats.productLine.toLowerCase().includes(productLineSearchText);
        });
    }
    
    if (gradeFilter !== 'all') {
        filteredTeachers = filteredTeachers.filter(name => {
            const stats = teacherStatsData[name];
            return stats.grade === gradeFilter;
        });
    }
    
    if (subjectFilter !== 'all') {
        filteredTeachers = filteredTeachers.filter(name => {
            const stats = teacherStatsData[name];
            return stats.subject === subjectFilter;
        });
    }
    
    // 场次ID搜索筛选
    if (sessionSearchText) {
        filteredTeachers = filteredTeachers.filter(name => {
            const stats = teacherStatsData[name];
            // 检查该主讲老师的所有场次中是否有匹配的场次ID
            if (stats.sessions) {
                return Array.from(stats.sessions).some(sessionId => 
                    sessionId.toLowerCase().includes(sessionSearchText)
                );
            }
            return false;
        });
    }
    
    // 排序数据
    filteredTeachers.sort((a, b) => {
        let valueA, valueB;
        
        if (sortField === 'name') {
            valueA = a;
            valueB = b;
        } else if (sortField === 'fiveStarRate') {
            const statsA = teacherStatsData[a];
            const statsB = teacherStatsData[b];
            valueA = statsA.totalCount > 0 ? (statsA.fiveStarCount / statsA.totalCount * 100) : 0;
            valueB = statsB.totalCount > 0 ? (statsB.fiveStarCount / statsB.totalCount * 100) : 0;
        } else if (sortField === 'oneStarRate') {
            const statsA = teacherStatsData[a];
            const statsB = teacherStatsData[b];
            valueA = statsA.totalCount > 0 ? (statsA.oneStarCount / statsA.totalCount * 100) : 0;
            valueB = statsB.totalCount > 0 ? (statsB.oneStarCount / statsB.totalCount * 100) : 0;
        } else {
            // 标签字段
            const statsA = teacherStatsData[a];
            const statsB = teacherStatsData[b];
            valueA = statsA.totalCount > 0 ? (statsA.labelCounts[sortField] / statsA.totalCount * 100) : 0;
            valueB = statsB.totalCount > 0 ? (statsB.labelCounts[sortField] / statsB.totalCount * 100) : 0;
        }
        
        if (sortField === 'name') {
            // 字符串排序
            if (sortOrder === 'asc') {
                return valueA.localeCompare(valueB);
            } else {
                return valueB.localeCompare(valueA);
            }
        } else {
            // 数值排序
            if (sortOrder === 'asc') {
                return valueA - valueB;
            } else {
                return valueB - valueA;
            }
        }
    });
    
    // 重新生成表格
    generateFilteredTeacherTable(filteredTeachers);
}

// 生成筛选后的主讲老师表格
function generateFilteredTeacherTable(filteredTeachers) {
    const teacherStatsBody = document.getElementById('teacher-stats-body');
    const sessionSearchText = teacherSessionSearch ? teacherSessionSearch.value.toLowerCase().trim() : '';
    
    let html = '';
    
    // 添加各个主讲老师的数据
    filteredTeachers.forEach(name => {
        const stats = teacherStatsData[name];
        const fiveStarRate = stats.totalCount > 0 ? (stats.fiveStarCount / stats.totalCount * 100) : 0;
        const oneStarRate = stats.totalCount > 0 ? (stats.oneStarCount / stats.totalCount * 100) : 0;
        
        const labelRates = {};
        Object.keys(stats.labelCounts).forEach(label => {
            labelRates[label] = stats.totalCount > 0 ? (stats.labelCounts[label] / stats.totalCount * 100) : 0;
        });
        
        // 判断是否高于平均值
        const fiveStarAboveAvg = fiveStarRate > teacherAverageStats.fiveStarRate;
        const oneStarAboveAvg = oneStarRate > teacherAverageStats.oneStarRate;
        
        const labelAboveAvg = {};
        Object.keys(labelRates).forEach(label => {
            labelAboveAvg[label] = labelRates[label] > teacherAverageStats.labelRates[label];
        });
        
        // 获取该主讲老师的所有场次，如果有场次ID搜索则只显示匹配的场次
        let teacherSessions = Array.from(stats.sessions || []);
        if (sessionSearchText) {
            teacherSessions = teacherSessions.filter(sessionId => 
                sessionId.toLowerCase().includes(sessionSearchText)
            );
        }
        const sessionCount = teacherSessions.length;
        
        // 为每个场次生成一行数据
        teacherSessions.forEach((sessionId, index) => {
            const sessionStat = sessionStatsData[sessionId];
            if (sessionStat) {
                const sessionFiveStarRate = sessionStat.totalCount > 0 ? (sessionStat.fiveStarCount / sessionStat.totalCount * 100) : 0;
                const sessionOneStarRate = sessionStat.totalCount > 0 ? (sessionStat.oneStarCount / sessionStat.totalCount * 100) : 0;
                
                const sessionLabelRates = {};
                Object.keys(sessionStat.labelCounts).forEach(label => {
                    sessionLabelRates[label] = sessionStat.totalCount > 0 ? (sessionStat.labelCounts[label] / sessionStat.totalCount * 100) : 0;
                });
                
                if (index === 0) {
                    // 第一行：显示主讲老师汇总数据 + 第一个场次数据
                    html += `
                    <tr>
                        <td class="teacher-name-cell" rowspan="${sessionCount}">${name}</td>
                        <td class="product-line-cell" rowspan="${sessionCount}">${stats.productLine || '-'}</td>
                        <td class="grade-cell" rowspan="${sessionCount}">${stats.grade || '-'}</td>
                        <td class="subject-cell" rowspan="${sessionCount}">${stats.subject || '-'}</td>
                        <td class="rate-cell five-star-rate ${fiveStarAboveAvg ? 'above-average-five-star' : ''}" rowspan="${sessionCount}">${fiveStarRate.toFixed(1)}%</td>
                        <td class="rate-cell ${labelAboveAvg['讲解很透彻'] ? 'above-average-five-star' : ''}" rowspan="${sessionCount}">${labelRates['讲解很透彻'].toFixed(1)}%</td>
                        <td class="rate-cell ${labelAboveAvg['非常幽默'] ? 'above-average-five-star' : ''}" rowspan="${sessionCount}">${labelRates['非常幽默'].toFixed(1)}%</td>
                        <td class="rate-cell ${labelAboveAvg['从来不拖堂'] ? 'above-average-five-star' : ''}" rowspan="${sessionCount}">${labelRates['从来不拖堂'].toFixed(1)}%</td>
                        <td class="rate-cell one-star-rate ${oneStarAboveAvg ? 'above-average-one-star' : ''}" rowspan="${sessionCount}">${oneStarRate.toFixed(1)}%</td>
                        <td class="rate-cell ${labelAboveAvg['讲解混乱'] ? 'above-average-one-star' : ''}" rowspan="${sessionCount}">${labelRates['讲解混乱'].toFixed(1)}%</td>
                        <td class="rate-cell ${labelAboveAvg['有点无聊'] ? 'above-average-one-star' : ''}" rowspan="${sessionCount}">${labelRates['有点无聊'].toFixed(1)}%</td>
                        <td class="rate-cell ${labelAboveAvg['每次都拖堂'] ? 'above-average-one-star' : ''}" rowspan="${sessionCount}">${labelRates['每次都拖堂'].toFixed(1)}%</td>
                        <td class="session-cell">${sessionId}</td>
                        <td class="session-time-cell">${sessionStat.sessionTime || '未知'}</td>
                        <td class="rate-cell">${sessionFiveStarRate.toFixed(1)}%</td>
                        <td class="rate-cell">${sessionLabelRates['讲解很透彻'].toFixed(1)}%</td>
                        <td class="rate-cell">${sessionLabelRates['非常幽默'].toFixed(1)}%</td>
                        <td class="rate-cell">${sessionLabelRates['从来不拖堂'].toFixed(1)}%</td>
                        <td class="rate-cell">${sessionOneStarRate.toFixed(1)}%</td>
                        <td class="rate-cell">${sessionLabelRates['讲解混乱'].toFixed(1)}%</td>
                        <td class="rate-cell">${sessionLabelRates['有点无聊'].toFixed(1)}%</td>
                        <td class="rate-cell">${sessionLabelRates['每次都拖堂'].toFixed(1)}%</td>
                    </tr>
                    `;
                } else {
                    // 其他场次行：只显示场次数据
                    html += `
                    <tr class="session-row">
                        <td class="session-cell">${sessionId}</td>
                        <td class="session-time-cell">${sessionStat.sessionTime || '未知'}</td>
                        <td class="rate-cell">${sessionFiveStarRate.toFixed(1)}%</td>
                        <td class="rate-cell">${sessionLabelRates['讲解很透彻'].toFixed(1)}%</td>
                        <td class="rate-cell">${sessionLabelRates['非常幽默'].toFixed(1)}%</td>
                        <td class="rate-cell">${sessionLabelRates['从来不拖堂'].toFixed(1)}%</td>
                        <td class="rate-cell">${sessionOneStarRate.toFixed(1)}%</td>
                        <td class="rate-cell">${sessionLabelRates['讲解混乱'].toFixed(1)}%</td>
                        <td class="rate-cell">${sessionLabelRates['有点无聊'].toFixed(1)}%</td>
                        <td class="rate-cell">${sessionLabelRates['每次都拖堂'].toFixed(1)}%</td>
                    </tr>
                    `;
                }
            }
        });
    });
    
    // 添加平均值行
    html += `
        <tr class="average-row">
            <td class="teacher-name-cell">该讲次主讲平均值</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">${teacherAverageStats.fiveStarRate.toFixed(1)}%</td>
            <td class="rate-cell">${teacherAverageStats.labelRates['讲解很透彻'].toFixed(1)}%</td>
            <td class="rate-cell">${teacherAverageStats.labelRates['非常幽默'].toFixed(1)}%</td>
            <td class="rate-cell">${teacherAverageStats.labelRates['从来不拖堂'].toFixed(1)}%</td>
            <td class="rate-cell">${teacherAverageStats.oneStarRate.toFixed(1)}%</td>
            <td class="rate-cell">${teacherAverageStats.labelRates['讲解混乱'].toFixed(1)}%</td>
            <td class="rate-cell">${teacherAverageStats.labelRates['有点无聊'].toFixed(1)}%</td>
            <td class="rate-cell">${teacherAverageStats.labelRates['每次都拖堂'].toFixed(1)}%</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
            <td class="rate-cell">-</td>
        </tr>
    `;
    
    teacherStatsBody.innerHTML = html;
} 

// 左侧导航菜单功能
function initSideNavigation() {
    const sideNav = document.getElementById('side-nav');
    const navItems = document.querySelectorAll('.nav-item');
    
    // 点击导航项时定位到对应模块
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            
            if (targetElement && !targetElement.classList.contains('hidden')) {
                // 移除所有激活状态
                navItems.forEach(nav => nav.classList.remove('active'));
                // 添加当前激活状态
                this.classList.add('active');
                
                // 平滑滚动到目标元素
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // 监听滚动事件，自动高亮当前可见的模块
    let ticking = false;
    function updateActiveNav() {
        if (!ticking) {
            requestAnimationFrame(() => {
                const sections = ['dashboard', 'teacher-analysis', 'comments-section', 'detailed-data'];
                let currentSection = '';
                
                sections.forEach(sectionId => {
                    const element = document.getElementById(sectionId);
                    if (element && !element.classList.contains('hidden')) {
                        const rect = element.getBoundingClientRect();
                        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                            currentSection = sectionId;
                        }
                    }
                });
                
                // 更新激活状态
                navItems.forEach(item => {
                    const targetId = item.getAttribute('data-target');
                    if (targetId === currentSection) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
                
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', updateActiveNav);
    
    return sideNav;
}

// 显示/隐藏导航菜单
function toggleSideNavigation(show) {
    const sideNav = document.getElementById('side-nav');
    const body = document.body;
    
    if (show) {
        sideNav.classList.remove('hidden');
        body.classList.add('nav-active');
    } else {
        sideNav.classList.add('hidden');
        body.classList.remove('nav-active');
    }
}

// 导出学员评价内容为Excel
function exportCommentsToExcel() {
    if (!filteredComments || filteredComments.length === 0) {
        alert('没有可导出的数据，请先筛选出评价内容');
        return;
    }
    
    try {
        // 准备导出数据
        const exportData = filteredComments.map(row => {
            // 获取场次ID（支持多种字段名）
            let sessionId = '';
            for (const field of fieldMapping.sessionIdFields) {
                if (row[field]) {
                    sessionId = String(row[field]);
                    break;
                }
            }
            
            // 提取评价内容
            const content = extractPlaceholder(row.stu_content) || '';
            
            // 格式化评价时间
            let evaluationTime = '';
            if (row.created_at) {
                try {
                    evaluationTime = new Date(row.created_at).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                } catch (e) {
                    evaluationTime = row.created_at;
                }
            }
            
            return {
                '场次ID': sessionId,
                '学生ID': row.stu_id || '',
                '评分': row.stu_score || '',
                '评价内容': content,
                '评价时间': evaluationTime
            };
        });
        
        // 创建工作簿
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);
        
        // 设置列宽
        const colWidths = [
            { wch: 15 }, // 场次ID
            { wch: 15 }, // 学生ID
            { wch: 8 },  // 评分
            { wch: 50 }, // 评价内容
            { wch: 20 }  // 评价时间
        ];
        ws['!cols'] = colWidths;
        
        // 添加工作表到工作簿
        XLSX.utils.book_append_sheet(wb, ws, '学员评价内容');
        
        // 生成文件名（包含当前时间）
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
        const filename = `学员评价内容_${timestamp}.xlsx`;
        
        // 导出文件
        XLSX.writeFile(wb, filename);
        
        // 显示成功消息
        alert(`成功导出 ${exportData.length} 条评价内容到文件：${filename}`);
        
    } catch (error) {
        console.error('导出Excel时发生错误:', error);
        alert('导出失败，请检查浏览器是否支持文件下载功能');
    }
}

// 重置主讲老师筛选条件
function resetTeacherFilters() {
    // 重置所有筛选控件到默认值
    if (teacherNameFilter) teacherNameFilter.value = 'all';
    if (teacherProductLineSearch) {
        teacherProductLineSearch.value = '';
        updateClearButtonVisibility(teacherProductLineSearch, clearProductLineBtn);
    }
    if (teacherGradeFilter) teacherGradeFilter.value = 'all';
    if (teacherSubjectFilter) teacherSubjectFilter.value = 'all';
    if (teacherSessionSearch) {
        teacherSessionSearch.value = '';
        updateClearButtonVisibility(teacherSessionSearch, clearSessionBtn);
    }
    if (teacherSortField) teacherSortField.value = 'fiveStarRate';
    if (teacherSortOrder) teacherSortOrder.value = 'desc';
    
    // 重新应用筛选（显示所有数据）
    applyTeacherFilters();
}

// 重置学生评价内容筛选条件
function resetCommentsFilters() {
    // 重置所有筛选控件到默认值
    if (commentsTeacherNameFilter) commentsTeacherNameFilter.value = 'all';
    if (commentsProductLineSearch) {
        commentsProductLineSearch.value = '';
        updateClearButtonVisibility(commentsProductLineSearch, commentsClearProductLineBtn);
    }
    if (commentsGradeFilter) commentsGradeFilter.value = 'all';
    if (commentsSubjectFilter) commentsSubjectFilter.value = 'all';
    if (commentsSessionSearch) {
        commentsSessionSearch.value = '';
        updateClearButtonVisibility(commentsSessionSearch, commentsClearSessionBtn);
    }
    if (commentsScoreFilterElement) commentsScoreFilterElement.value = 'all';
    if (commentsLabelFilterElement) commentsLabelFilterElement.value = 'all';
    
    // 重置标签筛选下拉框（因为评分筛选重置后需要显示所有标签）
    updateLabelFilterByScore('all', commentsLabelFilterElement);
    
    // 重新应用筛选（显示所有数据）
    applyCommentsFilters();
    commentsCurrentPage = 1;
    displayComments();
}