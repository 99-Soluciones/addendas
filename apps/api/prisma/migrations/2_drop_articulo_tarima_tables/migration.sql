-- Drop redundant normalized tables; xml_content on addendas is the source of truth.
DROP TABLE IF EXISTS core.addenda_articulo_tarima;
DROP TABLE IF EXISTS core.addenda_tarimas;
DROP TABLE IF EXISTS core.addenda_articulos;
