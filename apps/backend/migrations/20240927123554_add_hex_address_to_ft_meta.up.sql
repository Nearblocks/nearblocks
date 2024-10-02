ALTER TABLE ft_meta
ADD COLUMN nep518_hex_address TEXT;

CREATE INDEX ftm_nep518_hex_address_idx ON ft_meta USING btree (nep518_hex_address);
