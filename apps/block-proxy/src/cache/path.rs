use std::path::{Path, PathBuf};

/// Converts a block height to a sharded filesystem path within `cache_dir`.
///
/// Sharding strategy:
/// - Zero-pad height to 12 digits
/// - dir1 = first 6 digits (groups of 1,000,000 blocks)
/// - dir2 = next 3 digits (groups of 1,000 blocks within dir1)
/// - file = full 12-digit padded height + ".json.zst" (compressed) or ".json" (raw)
///
/// Example: height 42839521 (compressed)
///   padded  = "000042839521"
///   dir1    = "000042"
///   dir2    = "839"
///   result  = "{cache_dir}/000042/839/000042839521.json.zst"
///
/// This keeps each leaf directory at ≤1000 files, well within ext4 HTree
/// limits even for 200 billion blocks.
pub fn block_height_to_path(cache_dir: &Path, height: u64, compressed: bool) -> PathBuf {
    let padded = format!("{:012}", height);
    let dir1 = &padded[..6];
    let dir2 = &padded[6..9];
    let ext = if compressed { "json.zst" } else { "json" };
    let filename = format!("{}.{}", padded, ext);
    cache_dir.join(dir1).join(dir2).join(filename)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::Path;

    #[test]
    fn test_height_zero_compressed() {
        let p = block_height_to_path(Path::new("/cache"), 0, true);
        assert_eq!(p.to_str().unwrap(), "/cache/000000/000/000000000000.json.zst");
    }

    #[test]
    fn test_height_zero_uncompressed() {
        let p = block_height_to_path(Path::new("/cache"), 0, false);
        assert_eq!(p.to_str().unwrap(), "/cache/000000/000/000000000000.json");
    }

    #[test]
    fn test_height_42839521() {
        let p = block_height_to_path(Path::new("/cache"), 42839521, true);
        assert_eq!(p.to_str().unwrap(), "/cache/000042/839/000042839521.json.zst");
    }

    #[test]
    fn test_height_max_12_digits() {
        // 999_999_999_999 — maximum 12-digit block height
        let p = block_height_to_path(Path::new("/cache"), 999_999_999_999, true);
        assert_eq!(p.to_str().unwrap(), "/cache/999999/999/999999999999.json.zst");
    }
}
