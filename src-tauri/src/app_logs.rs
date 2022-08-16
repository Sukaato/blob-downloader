use log::LevelFilter;
use log4rs::append::file::FileAppender;
use log4rs::config::{Appender, Config, Root};
use log4rs::encode::pattern::PatternEncoder;
use tauri::api::path::document_dir;

pub fn setup() {
  let logfile = FileAppender::builder()
    .encoder(Box::new(PatternEncoder::new("[{l}] - {m}\n")))
    .build(document_dir().unwrap().to_str().unwrap().to_owned() + "/blob-downloader/log/output.log")
    .unwrap();

  let config = Config::builder()
    .appender(Appender::builder().build("logfile", Box::new(logfile)))
    .build(Root::builder().appender("logfile").build(LevelFilter::Info))
    .unwrap();

  log4rs::init_config(config).unwrap();
}
