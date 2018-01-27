#! /bin/bash

set -o pipefail

# define some functions

function trim {
    input=$1
    echo "${input##*()}"
}

function usage {
	echo "usage: mergeVideo -p filename_prefix -ax audio_extension -vx video_extension -del delimiter -vi video_input_dir -ai audio_input_dir -o output_path [ -cleanup ]"
	echo ""
	echo "  This utility is meant to concatenate audio and video files then merge them into on final mpeg file"
	echo ""
	echo "          Note: None of the arguments may contain spaces"
	echo "           -p : The prefix for all of the files to be concatenated"
	echo "          -ax : The extension of the audio files, currently only mp3 has been tested but other should work as well"
	echo "          -vx : The extension of the video files, currently only webm has been tested"
	echo "         -del : The delimiter used to separate the prefix from the right half of the file name: chunk_1.mp3, chunk_2.mp3, etc"
	echo "                may only contain one character"
	echo "          -vi : The input directory where the video files can be found (the path must end with an \"/\")."
	echo "          -ai : The input directory where the audio files can be found (the path must end with an \"/\")."
	echo "          -o  : The full path for the output file (including the filename and extension)."
	echo "     -cleanup : Delete all of the files used in the creation of the final output file"
}

function validateParameter {
	value=$1
	desc=$2

	if [ -z "$value" ] ; then
		echo "Error: $desc required" 1>&2;
		return 1
	fi

	trimedValue=($( trim "$value" ))
	
	if [ "$value" != "$trimedValue" ] ; then
		echo "Error: $desc must not contain white space" 1>&2;
		return 1
	fi
	return 0
}

if [ $# -lt 14 ] || [ $# -gt 15 ]; then
	usage 1>&2;
	exit 1;
fi

filenamePrefix=""
audioExtension=""
videoExtension=""
delimiter=""
output=""
videoInputDir=""
audioInputDir=""
doCleanup="false"

# Parse command line arguments
while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -p)
    	filenamePrefix="$2"
    shift
	;;
    -ax)
    	audioExtension="$2"
    shift
	;;
    -vx)
    	videoExtension="$2"
    shift
	;;
    -del)
    	delimiter="$2"
    shift
	;;
    -o)
        output="$2"
    shift
    ;;
    -vi)
        videoInputDir="$2"
    shift
    ;;
    -ai)
        audioInputDir="$2"
    shift
    ;;
    -cleanup)
    	doCleanup="true"
    shift
    ;;
    *)
    	echo "Unkown option $1" 1>&2
    ;;
esac
shift
done


# Validate input
validateParameter "$filenamePrefix" "filename prefix" ;     r1=$?;
validateParameter "$audioExtension" "audio extension" ;     r2=$?;
validateParameter "$videoExtension" "video extension" ;     r3=$?;
validateParameter "$delimiter"      "delimiter";            r4=$?;
validateParameter "$output"         "output file path";     r5=$?;
validateParameter "$videoInputDir" "video input directory"; r6=$?;
validateParameter "$audioInputDir" "audio input directory"; r7=$?;

if [ $(( $r1 + $r2 + $r3 + $r4 + $r5 + $r6 + $r7)) -ne 0 ] ; then
	usage;
	exit 1;
fi

echo "=========== Audio and Video File Merger =========="
echo "filename prefix:  $filenamePrefix"
echo "audio Extension:  $audioExtension"
echo "video Extension:  $videoExtension"
echo "delimiter:        $delimiter"
echo "output file path: $output"
echo "video Input Dir:  $videoInputDir"
echo "audio Input Dir:  $audioInputDir"
echo "Do Cleanup:       $doCleanup"


# Make sure our output delimiter is different then our input delimiter so we don't include it on a second run of the script
if [ "$delimiter" = "_" ] ; then
	outputDelimiter="-";
else
	outputDelimiter="_";
fi 

# figure out how many times the delimiter shows up in our path already so we can be intelligent about which token to tell sort to sort by
audioPathDelimCount=($( echo "$audioInputDir$filenamePrefix$delimiter" | grep -o "$delimiter" | wc -l )) ;
videoPathDelimCount=($( echo "$videoInputDir$filenamePrefix$delimiter" | grep -o "$delimiter" | wc -l )) ;

# Get audio and video file names that match the input then sort them by the token after the delimiter in the filename
sortedAudioFiles=($( ls $audioInputDir$filenamePrefix$delimiter*.$audioExtension 2>&1 | sort -n -t "$delimiter" -k $(( $audioPathDelimCount + 1 )) 2>&1 )); r1=$?;
sortedVideoFiles=($( ls $videoInputDir$filenamePrefix$delimiter*.$videoExtension 2>&1 | sort -n -t "$delimiter" -k $(( $videoPathDelimCount + 1 )) 2>&1 )); r2=$?;


# Make sure nothing went wrong when getting our file lists, if so then complain and bail
if [ $r1 -ne 0 ] ; then
	echo "Error: Unable to find audio files that match the following  $audioInputDir$filenamePrefix$delimiter*.$audioExtension" 1>&2;
fi
if [ $r2 -ne 0 ] ; then
	echo "Error: Unable to find video files that match the following $videoInputDir$filenamePrefix$delimiter*.$videoExtension" 1>&2;
fi
if [ $(($r1 + $r2)) -ne 0 ] ; then
	exit 1
fi


# Build our output filenames
videoOutputFile="$videoInputDir$filenamePrefix$outputDelimiter"video"$outputDelimiter"concatenated.mpeg
audioOutputFile="$audioInputDir$filenamePrefix$outputDelimiter"audio"$outputDelimiter"concatenated.mp3


echo " preparing to merge the following files"

videoFileCount=${#sortedVideoFiles[@]}
audioFileCount=${#sortedAudioFiles[@]}

if [ "$videoFileCount" -gt "$audioFileCount" ] ; then
	maxFileCount="$videoFileCount"
else
	maxFileCount="$audioFileCount"
fi


# Print the file list and at the same time build the input file parameters that will be used during the ffmpeg call later
echo "_________________________________________________________________"

audioInputFileArguments="${sortedAudioFiles[0]}"

index=0
while [ "$index" -lt "$maxFileCount" ]
do
	if [ "$index" -lt "$videoFileCount" ] ; then
		videoInputFileArguments="$videoInputFileArguments -i ${sortedVideoFiles[$index]}"
	    echo "${sortedVideoFiles[$index]}"
	fi

	if [ "$index" -lt "$audioFileCount" ] ; then
		if [ "$index" -ne 0 ] ; then
		    audioInputFileArguments="$audioInputFileArguments|${sortedAudioFiles[$index]}"
	    fi
	    echo "${sortedAudioFiles[$index]}"
	fi

	echo ""
	
	index=$(( $index + 1))
done

# If there were more then one video input files concatenate them
if [ "$videoFileCount" -gt 1 ] ; then
    # Concatenate our video and audio files
    echo -n "concatenating video files..."
    videoMergeOutput=($( ffmpeg $videoInputFileArguments -y -filter_complex "[0:v:0] [1:v:0] concat=n=$videoFileCount:v=1 [v]" -map "[v]" -b:v 2048k "$videoOutputFile" 2>&1))
    if [ $? -ne 0 ] ; then
        echo "Error: There was a problem merging the video files: ${videoMergeOutput[@]}" 1>&2
        exit 1
    fi
    echo "done"
else
    videoOutputFile="${sortedVideoFiles[0]}"
fi

# If there were more then one audio input files concatenate them
if [ "$audioFileCount" -gt 1 ] ; then
    echo -n "concatenating audio files..."
    audioMergeOutput=($( ffmpeg -i "concat:$audioInputFileArguments" -y "$audioOutputFile" 2>&1))
    if [ $? -ne 0 ] ; then
        echo "Error: There was a problem merging the audio files: ${audioMergeOutput[@]}" 1>&2
        exit 1
    fi
    echo "done"
else
    audioOutputFile="${sortedAudioFiles[0]}"
fi

# do our final merge
echo -n "merging audio and video together..."
finalMergeOutput=($( ffmpeg -i $videoOutputFile -i  $audioOutputFile -y -map 0:0 -map 1:0 -b:v 512k $output 2>&1 ))
if [ $? -ne 0 ] ; then 
	echo "Error: There was a problem merging the audio and video files together: ${finalMergeOutput[@]}}" 1>&2
	exit 1
fi
echo "done"
   


# If the user requested to do so delete all of the temporary files along with the source files
if [ "$doCleanup" = "true" ] ; then
	echo -n "performing cleanup..."
	
	rm -f "$videoOutputFile"
	rm -f "$audioOutputFile"

	index=0
	while [ "$index" -lt "$maxFileCount" ]
	do
		if [ "$index" -lt "$videoFileCount" ] ; then 
			rm -f "${sortedVideoFiles[$index]}"
		fi

		if [ "$index" -lt "$audioFileCount" ] ; then 
			rm -f "${sortedAudioFiles[$index]}"
		fi
		index=$(( $index + 1))
	done 
	echo "done"
fi

exit 0
