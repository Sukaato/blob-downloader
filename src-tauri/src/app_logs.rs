use log::LevelFilter;
use log4rs::append::file::FileAppender;
use log4rs::config::{Appender, Config, Root};
use log4rs::encode::pattern::PatternEncoder;

use crate::util::get_logs_dir;

pub fn setup() {
  let logfile = FileAppender::builder()
    .encoder(Box::new(PatternEncoder::new("[{l}] - {m}\n")))
    .build(get_logs_dir() + "/output.log")
    .unwrap();

  let config = Config::builder()
    .appender(Appender::builder().build("logfile", Box::new(logfile)))
    .build(Root::builder().appender("logfile").build(LevelFilter::Info))
    .unwrap();

  log4rs::init_config(config).unwrap();
}
