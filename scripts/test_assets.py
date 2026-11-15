import unittest
from io import BytesIO
from PIL import Image, PngImagePlugin
from generate_assets import same_asset


def encoded(image, level=9, metadata=None):
    output = BytesIO()
    image.save(output, 'PNG', compress_level=level, pnginfo=metadata)
    return output.getvalue()


class AssetEquivalenceTests(unittest.TestCase):
    def setUp(self):
        self.image = Image.new('RGB', (16, 16), (32, 67, 123))
        self.reference = encoded(self.image)

    def test_compression_does_not_change_artwork(self):
        alternate = encoded(self.image, 0)
        self.assertNotEqual(alternate, self.reference)
        self.assertTrue(same_asset(alternate, self.reference, png=True))

    def test_one_changed_pixel_is_stale(self):
        self.image.putpixel((7, 7), (32, 67, 124))
        self.assertFalse(same_asset(encoded(self.image), self.reference, png=True))

    def test_dimensions_alpha_and_metadata_must_match(self):
        metadata = PngImagePlugin.PngInfo()
        metadata.add_text('unexpected', 'metadata')
        for value in [encoded(self.image.resize((15, 16))), encoded(self.image.convert('RGBA')), encoded(self.image, metadata=metadata), b'not a png']:
            self.assertFalse(same_asset(value, self.reference, png=True))

    def test_vectors_still_require_exact_bytes(self):
        self.assertTrue(same_asset(b'<svg/>', b'<svg/>'))
        self.assertFalse(same_asset(b'<svg />', b'<svg/>'))


if __name__ == '__main__':
    unittest.main()
