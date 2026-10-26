/** Guide messages: English key, Italian, German, Japanese, Spanish, Russian, Chinese. */
export const manualLocaleRows:readonly (readonly string[])[] = [
 [
  "{device} editor guide",
  "Guida all’editor {device}",
  "Anleitung zum {device}-Editor",
  "{device}エディターガイド",
  "Guía del editor {device}",
  "Руководство редактора {device}",
  "{device}编辑器指南"
 ],
 [
  "Getting started",
  "Primi passi",
  "Erste Schritte",
  "はじめに",
  "Primeros pasos",
  "Начало работы",
  "入门"
 ],
 [
  "This is the {device} editor. Use the model timeline or selector to switch instruments. Drafts and views are kept separately for each model in this browser.",
  "Questo è l’editor {device}. Cambia strumento dalla cronologia o dal selettore. Il browser conserva bozze e viste separatamente per ogni modello.",
  "Dies ist der {device}-Editor. Instrument über Zeitachse oder Auswahl wechseln. Entwürfe und Ansichten werden pro Modell getrennt im Browser gespeichert.",
  "{device}エディターです。タイムラインまたは選択欄で楽器を切り替えます。ドラフトと表示はモデル別にブラウザーへ保存されます。",
  "Este es el editor {device}. Cambia de instrumento desde la cronología o el selector. El navegador conserva borradores y vistas por separado para cada modelo.",
  "Это редактор {device}. Меняйте инструмент на шкале моделей или селектором. Черновики и представления сохраняются в браузере отдельно для каждой модели.",
  "这是{device}编辑器。使用时间轴或型号选择器切换乐器。浏览器分别保存每个型号的草稿和视图。"
 ],
 [
  "Program edits a single sound; Combi combines Programs in timbres. The numbered display and ±1 / ±10 controls select sounds. Edit opens the parameter workspace. Auto Edit, when enabled, enters editing and arms Live after a successful device read.",
  "Program modifica un suono; Combi riunisce Program in timbri. Numero e ±1 / ±10 selezionano i suoni. Modifica apre i parametri. La modifica automatica attiva l’editor e Live dopo una lettura riuscita.",
  "Program bearbeitet einen Klang; Combi kombiniert Programs in Timbres. Nummer und ±1 / ±10 wählen Klänge. Bearbeiten öffnet Parameter. Automatische Bearbeitung aktiviert Editor und Live nach erfolgreichem Lesen.",
  "Programは単一音色、Combiは複数のProgramをティンバーに組み合わせます。番号と±1／±10で選択し、編集でパラメーターを開きます。自動編集は実機読み込み成功後に編集とライブを有効にします。",
  "Program edita un sonido; Combi combina Programs en timbres. El número y ±1 / ±10 seleccionan sonidos. Editar abre los parámetros. La edición automática activa el editor y directo tras una lectura correcta.",
  "Program редактирует один звук; Combi объединяет Program в тембры. Номер и ±1 / ±10 выбирают звуки. «Редактировать» открывает параметры. Автоправка включает редактор и Live после успешного чтения.",
  "Program编辑单个音色；Combi将多个Program组合为声部。通过编号和±1／±10选择音色，点击编辑打开参数。自动编辑会在成功读取设备后启用编辑及实时模式。"
 ],
 [
  "This guide follows the selected model and this editor instance. Opening it does not connect to MIDI, select a sound or send data.",
  "La guida segue modello e istanza. Aprirla non connette MIDI, non seleziona suoni e non invia dati.",
  "Die Anleitung folgt Modell und Instanz. Öffnen verbindet kein MIDI, wählt keinen Klang und sendet keine Daten.",
  "ガイドは選択モデルとインスタンスに追従します。開いてもMIDI接続、音色選択、データ送信は行いません。",
  "La guía sigue el modelo y la instancia. Abrirla no conecta MIDI, no selecciona sonidos ni envía datos.",
  "Руководство следует выбранной модели и экземпляру редактора. Его открытие не подключает MIDI, не выбирает звук и не отправляет данные.",
  "指南跟随当前型号与编辑器实例。打开指南不会连接MIDI、切换音色或发送数据。"
 ],
 [
  "Connection and keyboard",
  "Connessione e tastiera",
  "Verbindung und Tastatur",
  "接続とキーボード",
  "Conexión y teclado",
  "Подключение и клавиатура",
  "连接与键盘"
 ],
 [
  "Use the MIDI icon in the top bar to choose {device} input and output routes and the Global channel. Automatic detection looks for named instrument routes; if several pairs match, select the intended ports explicitly. Saved preferences are restored when those ports return.",
  "L’icona MIDI in alto sceglie ingressi e uscite {device} e canale Global. Il rilevamento cerca percorsi con il nome dello strumento; con più coppie scegli le porte esplicitamente. Le preferenze tornano con le porte salvate.",
  "Über das MIDI-Symbol oben Eingänge, Ausgänge für {device} und Global-Kanal wählen. Automatik sucht benannte Instrumentenports; mehrere Paare manuell zuordnen. Einstellungen werden bei Rückkehr der gespeicherten Ports wiederhergestellt.",
  "上部のMIDIアイコンで{device}の入出力とGlobalチャンネルを設定します。自動検出は機器名を含むポートを探します。候補が複数なら手動指定してください。保存済みポートが戻ると設定が復元されます。",
  "El icono MIDI superior permite elegir entradas y salidas de {device} y el canal Global. La detección busca rutas con nombre del instrumento; si hay varias parejas, elige los puertos. Las preferencias se restauran al volver los puertos guardados.",
  "Значком MIDI сверху выбираются входы и выходы {device} и канал Global. Автопоиск ищет маршруты по имени прибора; при нескольких парах укажите порты явно. Настройки восстанавливаются при возвращении сохранённых портов.",
  "通过顶部MIDI图标选择{device}输入、输出及Global通道。自动检测查找包含乐器名称的路由；若匹配多对端口，请明确选择。保存的端口恢复后会还原设置。"
 ],
 [
  "Allow MIDI/SysEx in the browser and enable exclusive messages on the instrument. Read requests the current buffer. If identification, mode or readback fails, verify routing and the selected variant before sending edits. A connected port alone does not prove the correct synth is responding.",
  "Autorizza MIDI/SysEx nel browser e i messaggi esclusivi sullo strumento. Leggi richiede il buffer corrente. Se identificazione, modo o rilettura falliscono, verifica porte e variante prima di inviare. Una porta connessa non prova che risponda il synth giusto.",
  "MIDI/SysEx im Browser und Exklusivnachrichten am Gerät erlauben. Lesen fragt den aktuellen Puffer ab. Bei Fehlern in Identifizierung, Modus oder Rücklesen vor Senden Routing und Variante prüfen. Ein verbundener Port beweist nicht den richtigen Synthesizer.",
  "ブラウザーでMIDI/SysExを許可し、実機でエクスクルーシブを有効にしてください。読み込みは現在バッファーを要求します。識別、モード、再読み込みに失敗したら、送信前に経路とモデルの種類を確認。ポート接続だけでは正しい機器の応答を証明できません。",
  "Permite MIDI/SysEx en el navegador y mensajes exclusivos en el equipo. Leer solicita el búfer actual. Si fallan identificación, modo o relectura, verifica ruta y variante antes de enviar. Un puerto conectado no demuestra que responde el sinte correcto.",
  "Разрешите MIDI/SysEx в браузере и эксклюзивные сообщения на приборе. «Считать» запрашивает текущий буфер. При сбое определения, режима или чтения проверьте маршрут и вариант перед отправкой. Подключённый порт не доказывает ответ нужного синтезатора.",
  "请在浏览器允许MIDI/SysEx，并在设备启用系统专用消息。读取会请求当前缓冲区。若识别、模式或回读失败，请在发送前检查路由与变体。端口连接成功不代表正确的合成器正在响应。"
 ],
 [
  "Additional keyboard and controller inputs can forward notes, velocity, sustain, CC, pitch bend and aftertouch to the instrument output. Keep them distinct from the instrument return. Choose whether to preserve input channels or use the Global channel. Panic releases held notes.",
  "Tastiera e controller aggiuntivi inoltrano note, velocity, sustain, CC, pitch bend e aftertouch all’uscita dello strumento. Non usare il ritorno dello strumento come ingresso aggiuntivo. Conserva i canali ricevuti o usa Global. Panic interrompe le note tenute.",
  "Zusätzliche Tastatur-/Controller-Eingänge leiten Noten, Anschlagstärke, Sustain, CC, Pitchbend und Aftertouch weiter. Vom Instrumentenrückweg getrennt halten. Eingangskanäle behalten oder Global-Kanal verwenden. Panic beendet gehaltene Noten.",
  "追加キーボード・コントローラー入力からノート、ベロシティ、サステイン、CC、ピッチベンド、アフタータッチを送れます。機器の戻り入力とは分離してください。受信チャンネル維持またはGlobalを選択。パニックで発音を停止します。",
  "Las entradas adicionales de teclado y controlador reenvían notas, velocidad, sustain, CC, pitch bend y aftertouch. Sepáralas del retorno del equipo. Conserva canales recibidos o usa Global. Pánico libera las notas sostenidas.",
  "Дополнительные входы клавиатуры и контроллера передают ноты, силу нажатия, сустейн, CC, pitch bend и aftertouch. Отделяйте их от возврата прибора. Сохраняйте входные каналы или используйте Global. «Паника» прекращает удерживаемые ноты.",
  "附加键盘与控制器输入可转发音符、力度、延音、CC、弯音和触后。请与设备返回输入区分。可保留输入通道或使用Global通道。紧急停止会关闭持续音符。"
 ],
 [
  "Program and effects",
  "Program ed effetti",
  "Program und Effekte",
  "Programとエフェクト",
  "Program y efectos",
  "Program и эффекты",
  "Program与效果"
 ],
 [
  "Read the current Program or import a file before working on real sounds. The oscillator, parameter and effect sections expose fields available for the chosen model. Multisample browsers search native names and numbers; similarly named samples on different ROMs are not necessarily identical.",
  "Leggi il Program corrente o importa un file prima di lavorare sui suoni reali. Oscillatori, parametri ed effetti mostrano i campi del modello scelto. Il browser multisample cerca nomi e numeri nativi; nomi simili su ROM diverse non garantiscono campioni uguali.",
  "Aktuelles Program lesen oder Datei importieren. Oszillator-, Parameter- und Effektbereiche zeigen Felder des gewählten Modells. Multisample-Suche nutzt Originalnamen und Nummern; ähnliche Namen auf verschiedenen ROMs garantieren keine identischen Samples.",
  "実際の音色を編集する前に現在のProgramを読み込むかファイルをインポートしてください。選択モデルに対応する発振器・パラメーター・エフェクトを表示します。マルチサンプルはネイティブ名と番号で検索。異なるROMの似た名前は同一サンプルを保証しません。",
  "Lee el Program actual o importa un archivo antes de trabajar con sonidos reales. Osciladores, parámetros y efectos muestran los campos del modelo. La búsqueda usa nombres y números nativos; nombres similares en distintas ROM no garantizan muestras iguales.",
  "Перед работой с реальными звуками считайте Program или импортируйте файл. Разделы осцилляторов, параметров и эффектов показывают поля выбранной модели. Поиск мультисэмплов использует исходные названия и номера; сходные названия в разных ROM не гарантируют одинаковые сэмплы.",
  "编辑真实音色前，请先读取当前Program或导入文件。振荡器、参数和效果区显示所选型号支持的字段。多重采样按原生名称与编号搜索；不同ROM中的相似名称不保证采样相同。"
 ],
 [
  "Live sends edits to the current temporary buffer and uses readback where implemented. Stop Live to continue locally. Undo/redo changes the local editor state; explicitly read or send when synchronizing. Changing an effect algorithm initializes its documented parameter ranges.",
  "Live invia modifiche al buffer temporaneo e usa rilettura dove prevista. Fermalo per continuare localmente. Annulla/ripristina cambia lo stato locale; leggi o invia per sincronizzare. Cambiare algoritmo inizializza i parametri nei limiti documentati.",
  "Live sendet Änderungen in den temporären Puffer und liest wo unterstützt zurück. Zum lokalen Arbeiten stoppen. Rückgängig/Wiederholen betrifft den lokalen Zustand; explizit lesen oder senden zum Synchronisieren. Algorithmuswechsel initialisiert dokumentierte Parameterbereiche.",
  "ライブは現在の一時バッファーに編集を送信し、対応時は再読み込みします。停止するとローカル編集になります。取り消し・やり直しはローカル状態を変更するため、同期は明示的に読み込み・送信してください。アルゴリズム変更は規定範囲でパラメーターを初期化します。",
  "Directo envía cambios al búfer temporal y relee cuando está implementado. Deténlo para continuar localmente. Deshacer/rehacer cambia el estado local; lee o envía para sincronizar. Cambiar algoritmo inicializa sus parámetros documentados.",
  "Live отправляет изменения во временный буфер и выполняет чтение, где оно поддержано. Остановите Live для локальной работы. Отмена/повтор меняют локальное состояние; для синхронизации считайте или отправьте данные явно. Смена алгоритма инициализирует параметры в документированных пределах.",
  "实时模式将修改发送到临时缓冲区，并在支持时回读。停止后可继续本地编辑。撤销／重做改变本地状态；同步时请明确读取或发送。更改算法会在规定范围内初始化参数。"
 ],
 [
  "Send and STORE are separate actions. A persistent memory write requires the dedicated write action and destination confirmation. For models other than the physically tested X5DR, hardware behavior still requires user validation.",
  "Invia e STORE sono distinti. La scrittura persistente richiede l’azione dedicata e la conferma della destinazione. Solo X5DR è stato testato fisicamente; gli altri modelli richiedono ancora verifica hardware degli utenti.",
  "Senden und STORE sind getrennt. Dauerhaftes Speichern benötigt die eigene Schreibaktion und Zielbestätigung. Nur X5DR wurde physisch geprüft; andere Modelle benötigen Hardwareprüfung durch Benutzer.",
  "送信とSTOREは別操作です。永続メモリー書き込みには専用操作と保存先確認が必要。実機検証済みはX5DRで、他モデルはユーザーによる実機検証が必要です。",
  "Enviar y STORE son acciones distintas. La escritura persistente exige la acción dedicada y confirmar el destino. X5DR fue probado físicamente; los demás modelos requieren validación de usuarios.",
  "Отправка и STORE — разные действия. Постоянная запись требует отдельной команды и подтверждения цели. Физически проверен X5DR; остальные модели ещё требуют проверки пользователями на приборе.",
  "发送与STORE是不同操作。永久写入需要专用写入动作及目标确认。目前已实机验证X5DR；其他型号仍需用户验证硬件行为。"
 ],
 [
  "Combi layers and Multi",
  "Layer Combi e Multi",
  "Combi-Layer und Multi",
  "CombiレイヤーとMulti",
  "Capas Combi y Multi",
  "Слои Combi и Multi",
  "Combi叠层与Multi"
 ],
 [
  "The keyboard overview shows each enabled timbre’s trigger range, velocity range and transpose. Transpose changes pitch without moving the trigger range. Use the range handles or numeric fields to edit the limits. Mute and Solo adjust the layer mix; restore the mix when finished.",
  "La vista tastiera mostra intervalli di tasti, velocity e trasposizione dei timbri attivi. La trasposizione cambia altezza senza spostare la zona. Modifica i limiti con maniglie o numeri. Mute e Solo regolano il mix; ripristinalo alla fine.",
  "Die Tastaturansicht zeigt Tasten-/Anschlagbereiche und Transposition aktiver Timbres. Transposition ändert die Tonhöhe, nicht die Auslösezone. Grenzen an Griffen oder Zahlen ändern. Mute/Solo ändern den Mix; anschließend wiederherstellen.",
  "キーボード概要は有効ティンバーの発音範囲、ベロシティ範囲、移調を表示します。移調は音高を変えますが発音範囲は動かしません。ハンドルや数値で境界を編集。Mute・Soloはミックスを変更するので、終了時に復元してください。",
  "El teclado muestra zonas de teclas, velocidad y transposición de los timbres activos. Transponer cambia la altura sin desplazar la zona. Edita límites con extremos o números. Mute y Solo ajustan la mezcla; restáurala al terminar.",
  "Обзор клавиатуры показывает диапазоны клавиш, силы нажатия и транспозицию активных тембров. Транспозиция меняет высоту, но не зону запуска. Границы правятся краями или числами. Mute и Solo меняют микс; восстановите его по завершении.",
  "键盘概览显示活动声部的琴键范围、力度范围及移调。移调改变音高而不移动触发范围。可用边缘手柄或数字编辑边界。Mute和Solo调整叠层混音，结束后请恢复。"
 ],
 [
  "Program names in a Combi come from known device banks, saved captures or ROM catalogs. An unread slot stays marked as unknown. A Combi contains references to Programs; exporting only the Combi does not include all dependent sounds or drum kits.",
  "I nomi Program di un Combi provengono da banchi noti, catture salvate o cataloghi ROM. Gli slot non letti restano sconosciuti. Il Combi contiene riferimenti a Program: esportarlo da solo non include tutti i suoni o kit dipendenti.",
  "Combi-Program-Namen stammen aus bekannten Gerätebänken, gespeicherten Aufnahmen oder ROM-Katalogen. Ungelesene Plätze bleiben unbekannt. Eine Combi enthält Program-Verweise; ihr Export allein enthält nicht alle abhängigen Klänge oder Drumkits.",
  "CombiのProgram名は既知の実機バンク、保存済みキャプチャ、ROMカタログから取得します。未読み込みスロットは不明のままです。CombiはProgramへの参照を保持するため、単独書き出しに依存音色・ドラムキットすべては含まれません。",
  "Los nombres Program del Combi vienen de bancos conocidos, capturas guardadas o catálogos ROM. Las posiciones no leídas siguen desconocidas. Combi contiene referencias a Programs; exportarlo solo no incluye todos los sonidos o kits dependientes.",
  "Названия Program в Combi берутся из известных банков, сохранённых снимков или каталогов ROM. Несчитанные ячейки остаются неизвестными. Combi хранит ссылки на Program; экспорт одной Combi не включает все зависимые звуки и ударные наборы.",
  "Combi中的Program名称来自已知设备音色组、已保存的捕获或ROM目录。未读取位置仍标记为未知。Combi只保存Program引用；单独导出不会包含全部依赖音色或鼓组。"
 ],
 [
  "Multi is a separate multitimbral setup. Its parts, channels and available system objects depend on the model. Use the Multi / Drums / Global workspace for the objects supported by this instrument.",
  "Multi è una configurazione multitimbrica separata. Parti, canali e oggetti dipendono dal modello. Usa Multi / Drums / Global per gli oggetti supportati.",
  "Multi ist eine getrennte multitimbrale Konfiguration. Parts, Kanäle und Objekte hängen vom Modell ab. Multi / Drums / Global enthält die unterstützten Systemobjekte.",
  "Multiは独立したマルチティンバー設定です。パート、チャンネル、システムオブジェクトはモデルに依存します。対応するオブジェクトはMulti／Drums／Globalで操作します。",
  "Multi es una configuración multitímbrica separada. Partes, canales y objetos dependen del modelo. Usa Multi / Drums / Global para los objetos admitidos.",
  "Multi — отдельная мультитембральная конфигурация. Партии, каналы и объекты зависят от модели. Используйте Multi / Drums / Global для поддерживаемых объектов.",
  "Multi是独立的多音色配置。声部、通道及系统对象取决于型号。请在Multi／Drums／Global区操作支持的对象。"
 ],
 [
  "Library and backups",
  "Libreria e backup",
  "Bibliothek und Sicherungen",
  "ライブラリとバックアップ",
  "Biblioteca y copias",
  "Библиотека и резервные копии",
  "音色库与备份"
 ],
 [
  "Import files or a folder from the library regardless of the currently selected synth. Format and family detection use the file contents; shared model IDs may require choosing the source variant. Source files remain preserved. Filter by family, synth, type, category or text.",
  "Importa file o cartelle dalla libreria con qualsiasi synth selezionato. Formato e famiglia sono rilevati dal contenuto; gli ID condivisi possono richiedere la variante sorgente. Gli originali sono conservati. Filtra per famiglia, synth, tipo, categoria o testo.",
  "Dateien oder Ordner unabhängig vom aktuellen Synthesizer importieren. Format und Familie werden am Inhalt erkannt; gemeinsame IDs erfordern eventuell eine Quellvariante. Originale bleiben erhalten. Nach Familie, Synthesizer, Typ, Kategorie oder Text filtern.",
  "選択中のシンセに関係なくライブラリへファイルやフォルダーをインポートできます。内容から形式とファミリーを検出。同じIDを持つ機種では元バリエーションの指定が必要な場合があります。元ファイルは保持され、系統・機種・種類・カテゴリ・文字で絞り込めます。",
  "Importa archivos o carpetas desde la biblioteca con cualquier sinte seleccionado. Formato y familia se detectan por contenido; los ID compartidos pueden requerir elegir variante. Se conservan originales. Filtra por familia, sinte, tipo, categoría o texto.",
  "Импортируйте файлы или папки независимо от выбранного синтезатора. Формат и семейство определяются по содержимому; при общих ID может потребоваться исходный вариант. Оригиналы сохраняются. Фильтры: семейство, модель, тип, категория, текст.",
  "无论当前选择哪个合成器，都可从音色库导入文件或文件夹。按内容检测格式与系列；共用ID可能需要指定来源变体。保留原始文件。可按系列、型号、类型、类别或文字筛选。"
 ],
 [
  "Click a row to inspect it. Double-click or Enter opens an editable copy, or prepares a conversion when needed. Organize patches with favorites, categories and local banks. Importing a file does not automatically install it in hardware memory.",
  "Un clic ispeziona la riga. Doppio clic o Invio apre una copia modificabile o prepara la conversione. Organizza con preferiti, categorie e banchi locali. Importare non installa automaticamente nella memoria hardware.",
  "Klick zeigt Details. Doppelklick oder Eingabe öffnet eine bearbeitbare Kopie oder bereitet Konvertierung vor. Mit Favoriten, Kategorien und lokalen Bänken organisieren. Import installiert nicht automatisch im Gerätespeicher.",
  "行をクリックして詳細を確認。ダブルクリックまたはEnterで編集コピーを開くか変換を準備します。お気に入り、カテゴリ、ローカルバンクで整理可能。インポートだけでは実機メモリーに自動登録されません。",
  "Un clic inspecciona la fila. Doble clic o Intro abre una copia editable o prepara conversión. Organiza con favoritos, categorías y bancos locales. Importar no instala automáticamente en la memoria física.",
  "Щелчок показывает сведения. Двойной щелчок или Enter открывает редактируемую копию либо готовит преобразование. Организуйте избранное, категории и локальные банки. Импорт не устанавливает данные в память прибора автоматически.",
  "单击行查看详情。双击或Enter打开可编辑副本，或准备转换。可用收藏、类别及本地音色组整理。导入不会自动安装到硬件存储器。"
 ],
 [
  "Save the complete libraries as a ZIP backup and keep it outside the browser. Reopen ZIP / JSON to restore supported saved library data. A .syx export contains synth messages; it is not a replacement for the library archive with original files and classification. Browser storage alone is not an external backup.",
  "Salva tutte le librerie in ZIP fuori dal browser. Riapri ZIP / JSON per ripristinare i dati supportati. .syx contiene messaggi del synth, non sostituisce l’archivio con originali e classificazione. Il solo browser non è un backup esterno.",
  "Alle Bibliotheken als ZIP außerhalb des Browsers sichern. ZIP / JSON öffnet unterstützte Sicherungsdaten. .syx enthält Synthesizer-Nachrichten und ersetzt nicht das Archiv mit Originaldateien und Klassifizierung. Browserdaten allein sind keine externe Sicherung.",
  "全ライブラリをZIPで保存し、ブラウザー外に保管してください。ZIP／JSONを開くと対応データを復元できます。.syxはシンセのメッセージで、元ファイル・分類を含むアーカイブの代用ではありません。ブラウザー保存だけでは外部バックアップになりません。",
  "Guarda todas las bibliotecas como ZIP fuera del navegador. Reabre ZIP / JSON para restaurar los datos admitidos. .syx contiene mensajes del sinte y no sustituye el archivo con originales y clasificación. El navegador solo no es copia externa.",
  "Сохраните все библиотеки в ZIP вне браузера. Откройте ZIP / JSON для восстановления поддерживаемых данных. .syx содержит сообщения синтезатора, но не заменяет архив с оригиналами и классификацией. Хранение в браузере не является внешней копией.",
  "将全部音色库备份为ZIP并保存在浏览器外。打开ZIP／JSON可恢复支持的数据。.syx只包含合成器消息，不能替代含原始文件和分类的备份。仅存于浏览器不算外部备份。"
 ],
 [
  "Conversions",
  "Conversioni",
  "Konvertierungen",
  "変換",
  "Conversiones",
  "Преобразования",
  "转换"
 ],
 [
  "Select source and target models, inspect compatibility and supply a target template when required. Review the report before opening the result. Structural compatibility and similar sample names do not guarantee identical sound; unsupported fields may retain the target template.",
  "Scegli modelli sorgente e destinazione, verifica compatibilità e fornisci un template se richiesto. Esamina il rapporto prima di aprire il risultato. Compatibilità strutturale e nomi simili non garantiscono suoni identici; i campi non supportati possono restare dal template.",
  "Quell-/Zielmodell wählen, Kompatibilität prüfen und nötige Zielvorlage bereitstellen. Vor Öffnen den Bericht prüfen. Strukturkompatibilität und ähnliche Sample-Namen garantieren keine Klangidentität; nicht unterstützte Felder können Vorlagenwerte behalten.",
  "変換元・先モデルを選び、互換性を確認し、必要なテンプレートを指定してください。結果を開く前にレポートを確認。構造の互換性やサンプル名の類似は同じ音を保証しません。非対応フィールドはテンプレート値を保持する場合があります。",
  "Elige modelos de origen y destino, revisa compatibilidad y aporta plantilla si se requiere. Revisa el informe antes de abrir. Compatibilidad estructural y nombres similares no garantizan el mismo sonido; los campos no admitidos pueden conservar la plantilla.",
  "Выберите исходную и целевую модели, проверьте совместимость, при необходимости укажите шаблон. Изучите отчёт перед открытием. Совместимость структуры и сходные названия не гарантируют одинакового звука; неподдерживаемые поля могут сохранить шаблон.",
  "选择来源与目标型号，检查兼容性，并在需要时提供目标模板。打开结果前查看报告。结构兼容或相似采样名称不保证相同音色；不支持的字段可能保留模板值。"
 ],
 [
  "Combi conversion needs the referenced source Programs and allocates target Program slots. Install the dependencies in the indicated locations before using that Combi on hardware. Separate effects and drum kits require their own handling. Conversion and local opening do not perform an automatic STORE.",
  "La conversione Combi richiede i Program sorgente referenziati e assegna slot destinazione. Installa prima le dipendenze nelle posizioni indicate. Effetti separati e kit vanno gestiti a parte. Conversione e apertura locale non eseguono STORE automatico.",
  "Combi-Konvertierung braucht referenzierte Quell-Programs und weist Zielplätze zu. Abhängigkeiten vor Nutzung am Gerät an den angegebenen Plätzen installieren. Separate Effekte und Kits separat behandeln. Konvertieren und lokal Öffnen führen kein automatisches STORE aus.",
  "Combi変換には参照元Programが必要で、変換先Programスロットを割り当てます。実機で使う前に依存データを指定位置へ配置してください。個別エフェクトとドラムキットは別途処理。変換・ローカル表示は自動STOREしません。",
  "Convertir Combi requiere sus Programs de origen y asigna posiciones de destino. Instala las dependencias en las posiciones indicadas antes de usarla. Efectos separados y kits se tratan aparte. Convertir y abrir localmente no realiza STORE automático.",
  "Преобразование Combi требует связанных исходных Program и выделяет целевые ячейки. Установите зависимости в указанные места до использования на приборе. Отдельные эффекты и наборы обрабатываются отдельно. Преобразование и локальное открытие не выполняют автоматический STORE.",
  "Combi转换需要其引用的源Program，并分配目标Program位置。在硬件使用前请将依赖项安装到指定位置。独立效果和鼓组需另行处理。转换及本地打开不会自动执行STORE。"
 ],
 [
  "Model-specific objects",
  "Oggetti specifici del modello",
  "Modellspezifische Objekte",
  "モデル固有のオブジェクト",
  "Objetos del modelo",
  "Объекты модели",
  "型号专属对象"
 ],
 [
  "Selected model: {device}. Protocol family: {family}. ROM catalog: {multi} multisamples and {drum} drum sounds. These are catalog counts, not a claim that all variants have identical ROMs.",
  "Modello: {device}. Famiglia protocollo: {family}. Catalogo ROM: {multi} multisample e {drum} suoni di batteria. I conteggi del catalogo non garantiscono ROM identiche tra varianti.",
  "Modell: {device}. Protokollfamilie: {family}. ROM-Katalog: {multi} Multisamples und {drum} Schlagzeugklänge. Katalogzahlen bedeuten keine identischen ROMs zwischen Varianten.",
  "モデル：{device}。プロトコル系統：{family}。ROMカタログ：マルチサンプル{multi}個、ドラム音{drum}個。カタログ件数はバリエーション間のROM同一性を意味しません。",
  "Modelo: {device}. Familia de protocolo: {family}. Catálogo ROM: {multi} multimuestras y {drum} sonidos de batería. Son cifras del catálogo; no garantizan ROM idénticas entre variantes.",
  "Модель: {device}. Семейство протокола: {family}. Каталог ROM: {multi} мультисэмплов и {drum} ударных звуков. Числа каталога не означают идентичные ROM у вариантов.",
  "当前型号：{device}。协议系列：{family}。ROM目录含{multi}个多重采样和{drum}个鼓音色。目录数量不代表各变体的ROM相同。"
 ],
 [
  "Read the desired system object before editing it. Models with separate effects use the dedicated Effect object; other models keep effects in Program / Combi data. Global and Drum Kit sends can modify device settings or kits: use their explicit apply/write controls.",
  "Leggi l’oggetto prima di modificarlo. I modelli con effetti separati usano Effect; gli altri mantengono gli effetti in Program / Combi. Gli invii Global e Drum Kit possono modificare impostazioni o kit: usa i comandi espliciti di applicazione/scrittura.",
  "Objekt vor Bearbeitung lesen. Modelle mit separaten Effekten verwenden Effect, andere speichern Effekte in Program / Combi. Senden von Global und Drumkit kann Geräteeinstellungen oder Kits ändern; explizite Anwenden-/Schreibbefehle nutzen.",
  "編集前にシステムオブジェクトを読み込んでください。個別エフェクト機種はEffect、それ以外はProgram／Combi内に保存します。Global・Drum Kit送信は設定やキットを変更することがあります。専用の適用・書き込み操作を使用してください。",
  "Lee el objeto antes de editarlo. Modelos con efectos separados usan Effect; los demás guardan efectos en Program / Combi. Los envíos Global y Drum Kit pueden modificar ajustes o kits: usa sus controles explícitos de aplicar/escribir.",
  "Считайте объект перед правкой. Модели с отдельными эффектами используют Effect; остальные хранят эффекты в Program / Combi. Отправка Global и Drum Kit может менять настройки и наборы: используйте явные команды применения/записи.",
  "编辑前先读取系统对象。独立效果型号使用Effect对象，其他型号在Program／Combi中保存效果。发送Global和Drum Kit可能改变设备设置或鼓组；请使用明确的应用／写入控件。"
 ],
 [
  "Manufacturer references",
  "Riferimenti del produttore",
  "Herstellerreferenzen",
  "メーカー資料",
  "Referencias del fabricante",
  "Документы производителя",
  "厂商参考资料"
 ],
 [
  "The guide above is bundled with the editor and works offline. Manufacturer documents below open externally and require Internet access. A family reference is labeled as such; verify the exact variant and firmware in its own manual.",
  "La guida è integrata e funziona offline. I documenti del produttore si aprono esternamente e richiedono Internet. Le fonti di famiglia sono segnalate; verifica variante esatta e firmware nel relativo manuale.",
  "Diese Anleitung ist integriert und offline verfügbar. Herstellerdokumente öffnen extern und benötigen Internet. Familienreferenzen sind gekennzeichnet; genaue Variante und Firmware im eigenen Handbuch prüfen.",
  "このガイドは内蔵されオフラインで使えます。メーカー資料は外部で開き、インターネット接続が必要です。ファミリー共通資料は明示しています。正確なバリエーションとファームウェアは専用マニュアルで確認してください。",
  "La guía está integrada y funciona sin conexión. Los documentos del fabricante se abren fuera y requieren Internet. Las referencias de familia están indicadas; verifica variante y firmware exactos en su manual.",
  "Руководство встроено и работает офлайн. Документы производителя открываются снаружи и требуют интернета. Общие документы семейства помечены; точный вариант и прошивку проверяйте в его руководстве.",
  "本指南内置于编辑器，可离线使用。下方厂商文档将在外部打开，需要网络。系列通用资料会明确标注；请在专属手册中核对具体变体与固件。"
 ]
]
