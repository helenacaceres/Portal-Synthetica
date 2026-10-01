// cai no placeholder "FOTO" de antes se não tiver imagem cadastrada.
export default function ImagemConteudo({ url, alt = "" }) {
  if (!url) return <span className="mono">FOTO</span>;
  return <img src={url} alt={alt} loading="lazy" />;
}
