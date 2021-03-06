$(function ()
{
    $('.imageUploadMultiple').each(function (index, item)
    {
        var $item = $(item);
        var RenderPhotoTpl = $item.find('.RenderPhoto').first().html();
        var $innerGroup = $item.find('.images-group');
        var $input = $item.find('.imageValue');

        var flow = new Flow({
            target: $item.data('target'),
            testChunks: false,
            chunkSize: 1024 * 1024 * 1024,
            query: {
                _token: $item.data('token')
            }
        });

        var updateValue = function ()
        {
            var values = [];
            $item.find('.thumbnail').each(function (index, thumb) {
                var $thumb = $(thumb);
                values.push($($thumb.find('img[data-src]')[0]).data('src'));
            });

            $input.val((values));
        };

        var urlItem = function (src, url) {
            return renderTPL(RenderPhotoTpl, {
                src: src,
                url: url || '/'+src,
                num: (new Date).getTime()
            });
        };

        flow.assignBrowse($item.find('.imageBrowse'));

        flow.on('filesSubmitted', function(file) {
            flow.upload();
        });

        flow.on('fileSuccess', function(file,message){
            flow.removeFile(file);
            var result = $.parseJSON(message);
            $innerGroup.append( urlItem(result.value, result.path) );

            updateValue();
        });

        $item.on('click', '.imageRemove', function (e)
        {
            e.preventDefault();
            $(this).closest('.imageThumbnail').remove();
            updateValue();
        });

        Sortable.create(document.getElementById('img-container'), { onUpdate: function () { updateValue(); } });
        updateValue();
    });
});

function renderTPL(template, data) {
    var out = '';
    if (template != '') {
        out = template.replace(/[\r\t\n]/g, " ")
            .split("[%").join("\t")
            .replace(/((^|%])[^\t]*)'/g, "$1\r")
            .replace(/\t=(.*?)%]/g, "',$1,'")
            .split("\t").join("');")
            .split("%]").join("p.push('")
            .split("\r").join("\\'");
        out = new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('"
            + out
            + "');}return p.join('');")(data);
    }
    return out;
}